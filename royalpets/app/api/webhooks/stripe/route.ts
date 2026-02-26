/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase";
import {
  verifyStripeWebhook,
  isWebhookConfigured,
  isHandledEventType,
  extractSessionMetadata,
  tierRequiresPrint,
  tierIsDigital,
} from "@/lib/webhooks";
import { sendOrderConfirmation } from "@/lib/email";
import { getTierById } from "@/lib/pricing";
import type { Database } from "@/types/supabase";

// Track processed events for idempotency (in production, use Redis or database)
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 1000;

interface WebhookResponse {
  success: boolean;
  message: string;
  orderId?: string;
}

/**
 * Check if event has already been processed (idempotency)
 */
function isEventProcessed(eventId: string): boolean {
  return processedEvents.has(eventId);
}

/**
 * Mark event as processed
 */
function markEventProcessed(eventId: string): void {
  // Keep set size manageable
  if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
    const firstItem = processedEvents.values().next().value;
    if (firstItem) {
      processedEvents.delete(firstItem);
    }
  }
  processedEvents.add(eventId);
}

/**
 * Log webhook error
 */
function logWebhookError(
  eventId: string,
  eventType: string,
  error: Error,
  metadata?: Record<string, unknown>
): void {
  console.error("=".repeat(60));
  console.error("❌ WEBHOOK ERROR");
  console.error("=".repeat(60));
  console.error(`Event ID: ${eventId}`);
  console.error(`Event Type: ${eventType}`);
  console.error(`Error: ${error.message}`);
  if (metadata) {
    console.error(`Metadata: ${JSON.stringify(metadata, null, 2)}`);
  }
  console.error("=".repeat(60));
}

/**
 * Log webhook success
 */
function logWebhookSuccess(
  eventId: string,
  eventType: string,
  orderId?: string,
  metadata?: Record<string, unknown>
): void {
  console.log("=".repeat(60));
  console.log("✅ WEBHOOK PROCESSED");
  console.log("=".repeat(60));
  console.log(`Event ID: ${eventId}`);
  console.log(`Event Type: ${eventType}`);
  if (orderId) {
    console.log(`Order ID: ${orderId}`);
  }
  if (metadata) {
    console.log(`Metadata: ${JSON.stringify(metadata, null, 2)}`);
  }
  console.log("=".repeat(60));
}

/**
 * Find order by Stripe session ID
 */
async function findOrderBySessionId(
  sessionId: string
): Promise<Database["public"]["Tables"]["orders"]["Row"] | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Update order status to paid
 */
async function updateOrderStatus(
  orderId: string,
  updates: Partial<Database["public"]["Tables"]["orders"]["Update"]>
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("orders")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error(`Failed to update order ${orderId}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Mark portrait as purchased (remove expiry)
 */
async function markPortraitAsPurchased(portraitId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("portraits")
    .update({
      expires_at: null, // Remove expiry for purchased portraits
      updated_at: new Date().toISOString(),
    })
    .eq("id", portraitId);

  if (error) {
    console.error(`Failed to mark portrait ${portraitId} as purchased:`, error.message);
    return false;
  }

  return true;
}

/**
 * Process checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(
  session: typeof stripe.checkout.sessions.retrieve extends () => Promise<infer R> ? R : never
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const sessionId = session.id;
  const metadata = extractSessionMetadata(session);

  // Find order in database
  const order = await findOrderBySessionId(sessionId);
  if (!order) {
    return { success: false, error: `Order not found for session: ${sessionId}` };
  }

  // Check if already paid (idempotency)
  if (order.status === "paid" || order.status === "processing") {
    console.log(`Order ${order.id} already processed, skipping`);
    return { success: true, orderId: order.id };
  }

  // Get payment intent ID if available
  const paymentIntentId = typeof session.payment_intent === "string" 
    ? session.payment_intent 
    : null;

  // Update order status to paid
  const orderUpdated = await updateOrderStatus(order.id, {
    status: "paid",
    stripe_payment_intent_id: paymentIntentId || undefined,
  });

  if (!orderUpdated) {
    return { success: false, error: "Failed to update order status" };
  }

  // Mark portrait as purchased (remove expiry)
  if (metadata.portraitId) {
    await markPortraitAsPurchased(metadata.portraitId);
  }

  // Get tier details for email
  const tier = metadata.tierId ? getTierById(metadata.tierId as any) : null;

  // Send order confirmation email
  await sendOrderConfirmation({
    orderId: order.id,
    customerEmail: order.customer_email,
    tierName: tier?.name || "Onbekend pakket",
    amountTotal: order.amount_total,
    petName: metadata.petName || undefined,
    isDigital: tierIsDigital(metadata.tierId),
    isPrint: tierRequiresPrint(metadata.tierId),
  });

  // Trigger fulfillment based on tier
  if (tierRequiresPrint(metadata.tierId)) {
    // Trigger print fulfillment
    await triggerPrintFulfillment(order.id, metadata);
  }

  if (tierIsDigital(metadata.tierId)) {
    // Trigger digital fulfillment
    await triggerDigitalFulfillment(order.id, metadata);
  }

  return { success: true, orderId: order.id };
}

/**
 * Trigger print fulfillment
 */
async function triggerPrintFulfillment(
  orderId: string,
  metadata: {
    portraitId: string | null;
    tierId: string | null;
    customerEmail: string | null;
    petName: string | null;
    costumeId: string | null;
  }
): Promise<void> {
  console.log(`Triggering print fulfillment for order: ${orderId}`);
  
  // Update order status to processing
  await updateOrderStatus(orderId, { status: "processing" });

  // TODO: Integrate with print partner API
  // This will be implemented in story-12-print-partner-integration
  console.log(`Print fulfillment triggered for order ${orderId}`);
  console.log(`Portrait ID: ${metadata.portraitId}, Tier: ${metadata.tierId}`);
}

/**
 * Trigger digital fulfillment
 */
async function triggerDigitalFulfillment(
  orderId: string,
  metadata: {
    portraitId: string | null;
    tierId: string | null;
    customerEmail: string | null;
    petName: string | null;
    costumeId: string | null;
  }
): Promise<void> {
  console.log(`Triggering digital fulfillment for order: ${orderId}`);

  // TODO: Generate high-res images and create download links
  // This will generate high-res versions and store download URLs
  console.log(`Digital fulfillment triggered for order ${orderId}`);
  console.log(`Portrait ID: ${metadata.portraitId}, Tier: ${metadata.tierId}`);

  // For digital-basic: Upscale selected image to 2048x2048
  // For digital-premium: Upscale all 4 images to 4096x4096 + generate source files
}

/**
 * Handle failed payments
 */
async function handlePaymentFailed(
  session: typeof stripe.checkout.sessions.retrieve extends () => Promise<infer R> ? R : never
): Promise<{ success: boolean; error?: string }> {
  const sessionId = session.id;
  
  const order = await findOrderBySessionId(sessionId);
  if (!order) {
    return { success: false, error: `Order not found for session: ${sessionId}` };
  }

  // Update order status to cancelled
  await updateOrderStatus(order.id, { status: "cancelled" });

  console.log(`Payment failed for order: ${order.id}`);
  return { success: true };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if webhook is configured
    if (!isWebhookConfigured()) {
      console.error("Stripe webhook secret not configured");
      return NextResponse.json(
        { success: false, message: "Webhook not configured" } as WebhookResponse,
        { status: 503 }
      );
    }

    // Get the raw body and signature
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature header");
      return NextResponse.json(
        { success: false, message: "Missing signature" } as WebhookResponse,
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: ReturnType<typeof verifyStripeWebhook>;
    try {
      event = verifyStripeWebhook(payload, signature);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", errorMessage);
      return NextResponse.json(
        { success: false, message: "Invalid signature" } as WebhookResponse,
        { status: 400 }
      );
    }

    const eventId = event.id;
    const eventType = event.type;

    // Check idempotency - already processed?
    if (isEventProcessed(eventId)) {
      console.log(`Event ${eventId} already processed, skipping`);
      return NextResponse.json(
        { success: true, message: "Event already processed" } as WebhookResponse,
        { status: 200 }
      );
    }

    // Check if we handle this event type
    if (!isHandledEventType(eventType)) {
      console.log(`Unhandled event type: ${eventType}`);
      return NextResponse.json(
        { success: true, message: "Event type not handled" } as WebhookResponse,
        { status: 200 }
      );
    }

    // Process the event
    let result: { success: boolean; orderId?: string; error?: string } = { success: false, error: "Unknown error" };

    try {
      switch (eventType) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object as typeof stripe.checkout.sessions.retrieve extends () => Promise<infer R> ? R : never;
          result = await handleCheckoutSessionCompleted(session);
          break;
        }

        case "checkout.session.async_payment_failed": {
          const session = event.data.object as typeof stripe.checkout.sessions.retrieve extends () => Promise<infer R> ? R : never;
          result = await handlePaymentFailed(session);
          break;
        }

        case "payment_intent.succeeded": {
          // Handle payment_intent.succeeded if needed
          // Usually checkout.session.completed is sufficient
          console.log(`Payment intent succeeded: ${event.data.object.id}`);
          result = { success: true };
          break;
        }

        case "payment_intent.payment_failed": {
          console.log(`Payment intent failed: ${event.data.object.id}`);
          result = { success: true };
          break;
        }
      }

      // Mark event as processed for idempotency
      markEventProcessed(eventId);

      if (result.success) {
        logWebhookSuccess(eventId, eventType, result.orderId);
        return NextResponse.json(
          {
            success: true,
            message: "Webhook processed successfully",
            orderId: result.orderId,
          } as WebhookResponse,
          { status: 200 }
        );
      } else {
        logWebhookError(eventId, eventType, new Error(result.error || "Unknown error"));
        return NextResponse.json(
          {
            success: false,
            message: result.error || "Failed to process webhook",
          } as WebhookResponse,
          { status: 500 }
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logWebhookError(eventId, eventType, error instanceof Error ? error : new Error(errorMessage), {
        sessionId: (event.data.object as any)?.id,
      });
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        } as WebhookResponse,
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      } as WebhookResponse,
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight (webhooks typically don't need this but good to have)
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    },
  });
}
