/**
 * @jest-environment node
 */

import {
  verifyStripeWebhook,
  isWebhookConfigured,
  isHandledEventType,
  extractSessionMetadata,
  tierRequiresPrint,
  tierIsDigital,
  HANDLED_EVENT_TYPES,
  getIdempotencyKey,
} from "@/lib/webhooks";
import { stripe } from "@/lib/stripe";

// Mock the stripe module
jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

describe("lib/webhooks", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("isWebhookConfigured", () => {
    it("returns true when STRIPE_WEBHOOK_SECRET is set", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
      // Need to reimport to get fresh env
      jest.isolateModules(() => {
        const { isWebhookConfigured } = require("@/lib/webhooks");
        expect(isWebhookConfigured()).toBe(true);
      });
    });

    it("returns false when STRIPE_WEBHOOK_SECRET is not set", () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      jest.isolateModules(() => {
        const { isWebhookConfigured } = require("@/lib/webhooks");
        expect(isWebhookConfigured()).toBe(false);
      });
    });
  });

  describe("verifyStripeWebhook", () => {
    const mockPayload = "test-payload";
    const mockSignature = "test-signature";
    const mockEvent = { id: "evt_test", type: "checkout.session.completed" };

    beforeEach(() => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_webhook_secret";
    });

    it("successfully verifies valid webhook signature", () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockEvent);

      const result = verifyStripeWebhook(mockPayload, mockSignature);

      expect(result).toEqual(mockEvent);
      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockPayload,
        mockSignature,
        "whsec_test_webhook_secret"
      );
    });

    it("throws error when webhook secret is not configured", () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      jest.isolateModules(() => {
        const { verifyStripeWebhook } = require("@/lib/webhooks");
        expect(() => verifyStripeWebhook(mockPayload, mockSignature)).toThrow(
          "Stripe webhook secret not configured"
        );
      });
    });

    it("throws error when signature is missing", () => {
      expect(() => verifyStripeWebhook(mockPayload, null)).toThrow(
        "Missing Stripe signature header"
      );
    });

    it("throws error when signature verification fails", () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid signature");
      });

      expect(() => verifyStripeWebhook(mockPayload, mockSignature)).toThrow(
        "Webhook signature verification failed: Invalid signature"
      );
    });
  });

  describe("isHandledEventType", () => {
    it("returns true for handled event types", () => {
      HANDLED_EVENT_TYPES.forEach((eventType) => {
        expect(isHandledEventType(eventType)).toBe(true);
      });
    });

    it("returns false for unhandled event types", () => {
      const unhandledTypes = [
        "customer.created",
        "invoice.paid",
        "charge.succeeded",
        "subscription.created",
      ];

      unhandledTypes.forEach((eventType) => {
        expect(isHandledEventType(eventType)).toBe(false);
      });
    });
  });

  describe("extractSessionMetadata", () => {
    it("extracts all metadata fields correctly", () => {
      const session = {
        id: "cs_test_123",
        metadata: {
          portraitId: "portrait_123",
          tierId: "digital-basic",
          customerEmail: "test@example.com",
          petName: "Fluffy",
          costumeId: "koning",
        },
        customer_email: "customer@example.com",
      };

      const result = extractSessionMetadata(session as any);

      expect(result).toEqual({
        portraitId: "portrait_123",
        tierId: "digital-basic",
        customerEmail: "test@example.com",
        petName: "Fluffy",
        costumeId: "koning",
      });
    });

    it("falls back to session.customer_email when metadata.customerEmail is missing", () => {
      const session = {
        id: "cs_test_123",
        metadata: {},
        customer_email: "fallback@example.com",
      };

      const result = extractSessionMetadata(session as any);

      expect(result.customerEmail).toBe("fallback@example.com");
    });

    it("returns null for missing metadata fields", () => {
      const session = {
        id: "cs_test_123",
        metadata: {},
        customer_email: null,
      };

      const result = extractSessionMetadata(session as any);

      expect(result).toEqual({
        portraitId: null,
        tierId: null,
        customerEmail: null,
        petName: null,
        costumeId: null,
      });
    });
  });

  describe("tierRequiresPrint", () => {
    it("returns true for print tiers", () => {
      expect(tierRequiresPrint("print-digital")).toBe(true);
      expect(tierRequiresPrint("canvas-deluxe")).toBe(true);
    });

    it("returns false for digital tiers", () => {
      expect(tierRequiresPrint("digital-basic")).toBe(false);
      expect(tierRequiresPrint("digital-premium")).toBe(false);
    });

    it("returns false for null tier", () => {
      expect(tierRequiresPrint(null)).toBe(false);
    });
  });

  describe("tierIsDigital", () => {
    it("returns true for digital tiers", () => {
      expect(tierIsDigital("digital-basic")).toBe(true);
      expect(tierIsDigital("digital-premium")).toBe(true);
    });

    it("returns false for print tiers", () => {
      expect(tierIsDigital("print-digital")).toBe(false);
      expect(tierIsDigital("canvas-deluxe")).toBe(false);
    });

    it("returns false for null tier", () => {
      expect(tierIsDigital(null)).toBe(false);
    });
  });

  describe("getIdempotencyKey", () => {
    it("generates consistent idempotency key for same event", () => {
      const eventId = "evt_test_123";
      const key1 = getIdempotencyKey(eventId);
      const key2 = getIdempotencyKey(eventId);

      expect(key1).toBe(key2);
      expect(key1).toBe("webhook:evt_test_123");
    });

    it("generates different keys for different events", () => {
      const key1 = getIdempotencyKey("evt_1");
      const key2 = getIdempotencyKey("evt_2");

      expect(key1).not.toBe(key2);
    });
  });

  describe("HANDLED_EVENT_TYPES", () => {
    it("contains all expected event types", () => {
      expect(HANDLED_EVENT_TYPES).toContain("checkout.session.completed");
      expect(HANDLED_EVENT_TYPES).toContain("checkout.session.async_payment_succeeded");
      expect(HANDLED_EVENT_TYPES).toContain("checkout.session.async_payment_failed");
      expect(HANDLED_EVENT_TYPES).toContain("payment_intent.succeeded");
      expect(HANDLED_EVENT_TYPES).toContain("payment_intent.payment_failed");
    });

    it("has correct type definition", () => {
      // TypeScript compile-time check - if this compiles, the types are correct
      const _typeCheck: (typeof HANDLED_EVENT_TYPES)[number] = "checkout.session.completed";
      expect(_typeCheck).toBe("checkout.session.completed");
    });
  });
});
