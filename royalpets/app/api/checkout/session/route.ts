import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured, calculatePriceWithBTW, getTierProductName, getTierProductDescription, isValidTierId, tierIdToDatabaseEnum } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase";
import { getTierById } from "@/lib/pricing";
import type { Database } from "@/types/supabase";

// Get app URL from environment
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface CheckoutSessionRequest {
  tierId: string;
  portraitId: string;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutSessionResponse {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  message?: string;
  errors?: string[];
}

/**
 * Validate the request body
 */
function validateRequest(body: unknown): { valid: boolean; errors: string[]; data?: CheckoutSessionRequest } {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    errors.push("Request body must be an object");
    return { valid: false, errors };
  }

  const { tierId, portraitId, customerEmail, successUrl, cancelUrl } = body as CheckoutSessionRequest;

  // Validate tierId
  if (!tierId || typeof tierId !== "string") {
    errors.push("tierId is required and must be a string");
  } else if (!isValidTierId(tierId)) {
    errors.push(`Invalid tierId: ${tierId}`);
  }

  // Validate portraitId
  if (!portraitId || typeof portraitId !== "string") {
    errors.push("portraitId is required and must be a string");
  }

  // Validate customerEmail
  if (!customerEmail || typeof customerEmail !== "string") {
    errors.push("customerEmail is required and must be a string");
  } else {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      errors.push("customerEmail must be a valid email address");
    }
  }

  // Validate optional URLs if provided
  if (successUrl && typeof successUrl !== "string") {
    errors.push("successUrl must be a string");
  }
  if (cancelUrl && typeof cancelUrl !== "string") {
    errors.push("cancelUrl must be a string");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      tierId,
      portraitId,
      customerEmail,
      successUrl,
      cancelUrl,
    },
  };
}

/**
 * Verify portrait exists and is completed
 */
async function verifyPortrait(portraitId: string): Promise<{ valid: boolean; error?: string; portrait?: Database["public"]["Tables"]["portraits"]["Row"] }> {
  const supabase = createServiceRoleClient();

  const { data: portrait, error } = await supabase
    .from("portraits")
    .select("*")
    .eq("id", portraitId)
    .single();

  if (error || !portrait) {
    return { valid: false, error: "Portrait not found" };
  }

  if (portrait.status !== "completed") {
    return { valid: false, error: "Portrait generation not completed" };
  }

  if (!portrait.generated_images || !Array.isArray(portrait.generated_images) || portrait.generated_images.length === 0) {
    return { valid: false, error: "Portrait has no generated images" };
  }

  return { valid: true, portrait };
}

/**
 * Create order record in database
 */
async function createOrderRecord(
  sessionId: string,
  data: CheckoutSessionRequest,
  tierPrice: number
): Promise<string> {
  const supabase = createServiceRoleClient();
  
  const { subtotal, taxAmount, total } = calculatePriceWithBTW(tierPrice);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      session_id: sessionId,
      portrait_id: data.portraitId,
      customer_email: data.customerEmail,
      product_tier: tierIdToDatabaseEnum(data.tierId),
      amount_subtotal: subtotal,
      amount_total: total,
      tax_amount: taxAmount,
      currency: "eur",
      status: "pending",
      stripe_checkout_session_id: sessionId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create order record: ${error.message}`);
  }

  return order.id;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment service not configured",
        } as CheckoutSessionResponse,
        { status: 503 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        } as CheckoutSessionResponse,
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        } as CheckoutSessionResponse,
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Get tier details
    const tier = getTierById(data.tierId as "digital-basic" | "digital-premium" | "print-digital" | "canvas-deluxe");
    if (!tier) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pricing tier",
        } as CheckoutSessionResponse,
        { status: 400 }
      );
    }

    // Verify portrait exists and is completed
    const portraitCheck = await verifyPortrait(data.portraitId);
    if (!portraitCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          message: portraitCheck.error,
        } as CheckoutSessionResponse,
        { status: 400 }
      );
    }

    // Calculate price with BTW
    const { subtotal, taxAmount } = calculatePriceWithBTW(tier.price);

    // Determine success and cancel URLs
    const successUrl = data.successUrl || `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = data.cancelUrl || `${appUrl}/checkout/cancel`;

    // Get the selected image or first generated image for metadata
    const portrait = portraitCheck.portrait!;
    const selectedImage = portrait.selected_image_index !== null 
      ? (portrait.generated_images as Array<{ url: string; path: string; index: number }>)[portrait.selected_image_index]
      : (portrait.generated_images as Array<{ url: string; path: string; index: number }>)[0];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["ideal", "card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: getTierProductName(data.tierId),
              description: getTierProductDescription(data.tierId),
              images: selectedImage ? [selectedImage.url] : undefined,
            },
            unit_amount: Math.round(tier.price * 100), // Convert to cents
            tax_behavior: "inclusive",
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: data.customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        portraitId: data.portraitId,
        tierId: data.tierId,
        customerEmail: data.customerEmail,
        petName: portrait.pet_name || "",
        costumeId: portrait.costume_id || "",
      },
      payment_intent_data: {
        metadata: {
          portraitId: data.portraitId,
          tierId: data.tierId,
        },
      },
      // Enable automatic tax calculation if configured
      // automatic_tax: { enabled: true },
      // For now, we include tax in the price
      invoice_creation: {
        enabled: true,
      },
      locale: "nl",
    });

    // Create order record in database
    const orderId = await createOrderRecord(session.id, data, tier.price);

    console.log(`Checkout session created: ${session.id}, Order: ${orderId}`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    } as CheckoutSessionResponse);

  } catch (error) {
    console.error("Checkout session error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      } as CheckoutSessionResponse,
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
