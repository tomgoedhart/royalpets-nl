import Stripe from "stripe";

// Environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

/**
 * Stripe server-side client
 * WARNING: Only use this in secure server contexts (Server Actions, API Routes)
 * Never expose this client to the browser
 */
export const stripe = new Stripe(stripeSecretKey || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

/**
 * Get the publishable key for client-side use
 */
export function getStripePublishableKey(): string {
  return stripePublishableKey || "";
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!stripeSecretKey && !!stripePublishableKey;
}

/**
 * BTW/VAT rate for Netherlands (21%)
 */
export const BTW_RATE = 0.21;

/**
 * Calculate price with BTW
 * Returns both subtotal (excl. BTW) and total (incl. BTW)
 */
export function calculatePriceWithBTW(price: number): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  // Price is stored as inclusive amount, calculate excl. BTW
  const subtotal = Math.round((price / (1 + BTW_RATE)) * 100) / 100;
  const taxAmount = Math.round((price - subtotal) * 100) / 100;
  
  return {
    subtotal,
    taxAmount,
    total: price,
  };
}

/**
 * Convert tier ID to Stripe product metadata format
 */
export function getTierProductName(tierId: string): string {
  const names: Record<string, string> = {
    "digital-basic": "Digitaal Basis",
    "digital-premium": "Digitaal Premium",
    "print-digital": "Print + Digitaal",
    "canvas-deluxe": "Canvas Deluxe",
  };
  return names[tierId] || "Onbekend Product";
}

/**
 * Get product description for Stripe line item
 */
export function getTierProductDescription(tierId: string): string {
  const descriptions: Record<string, string> = {
    "digital-basic": "1 high-res portret (2048x2048) zonder watermerk",
    "digital-premium": "4 high-res portretten (4096x4096) + bronbestanden",
    "print-digital": "Premium print 30x30cm + alle digitale bestanden",
    "canvas-deluxe": "Premium canvas 40x40cm + alle digitale bestanden",
  };
  return descriptions[tierId] || "Koninklijk huisdierportret";
}

/**
 * Validate tier ID
 */
export function isValidTierId(tierId: string): boolean {
  return ["digital-basic", "digital-premium", "print-digital", "canvas-deluxe"].includes(tierId);
}

/**
 * Convert tier ID to database enum format
 */
export function tierIdToDatabaseEnum(tierId: string): "digital_basic" | "digital_premium" | "print_digital" | "canvas_deluxe" {
  const mapping: Record<string, "digital_basic" | "digital_premium" | "print_digital" | "canvas_deluxe"> = {
    "digital-basic": "digital_basic",
    "digital-premium": "digital_premium",
    "print-digital": "print_digital",
    "canvas-deluxe": "canvas_deluxe",
  };
  return mapping[tierId] || "digital_basic";
}
