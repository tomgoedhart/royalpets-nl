import Stripe from "stripe";
import { stripe } from "./stripe";

// Environment variables
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Check if Stripe webhook secret is configured
 */
export function isWebhookConfigured(): boolean {
  return !!stripeWebhookSecret;
}

/**
 * Verify Stripe webhook signature
 * @param payload - The raw request body
 * @param signature - The Stripe-Signature header
 * @returns The verified event or throws error
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string | null
): Stripe.Event {
  if (!stripeWebhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }

  if (!signature) {
    throw new Error("Missing Stripe signature header");
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeWebhookSecret
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Webhook signature verification failed: ${errorMessage}`);
  }
}

/**
 * Webhook event types we handle
 */
export const HANDLED_EVENT_TYPES = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
] as const;

export type HandledEventType = (typeof HANDLED_EVENT_TYPES)[number];

/**
 * Check if event type is one we handle
 */
export function isHandledEventType(eventType: string): eventType is HandledEventType {
  return HANDLED_EVENT_TYPES.includes(eventType as HandledEventType);
}

/**
 * Extract portrait and tier info from session metadata
 */
export function extractSessionMetadata(
  session: Stripe.Checkout.Session
): {
  portraitId: string | null;
  tierId: string | null;
  customerEmail: string | null;
  petName: string | null;
  costumeId: string | null;
} {
  const metadata = session.metadata || {};
  return {
    portraitId: metadata.portraitId || null,
    tierId: metadata.tierId || null,
    customerEmail: metadata.customerEmail || session.customer_email || null,
    petName: metadata.petName || null,
    costumeId: metadata.costumeId || null,
  };
}

/**
 * Idempotency key for webhook processing
 * Uses event ID to prevent duplicate processing
 */
export function getIdempotencyKey(eventId: string): string {
  return `webhook:${eventId}`;
}

/**
 * Check if a tier requires print fulfillment
 */
export function tierRequiresPrint(tierId: string | null): boolean {
  if (!tierId) return false;
  return tierId === "print-digital" || tierId === "canvas-deluxe";
}

/**
 * Check if a tier is digital-only
 */
export function tierIsDigital(tierId: string | null): boolean {
  if (!tierId) return false;
  return tierId === "digital-basic" || tierId === "digital-premium";
}
