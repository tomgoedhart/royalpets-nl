/**
 * @jest-environment node
 */

import { POST, OPTIONS } from "@/app/api/webhooks/stripe/route";
import { stripe } from "@/lib/stripe";
import * as emailModule from "@/lib/email";
import * as pricingModule from "@/lib/pricing";

// Mock dependencies
jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockUpdate = jest.fn(() => ({ eq: mockEq }));
const mockInsert = jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) }));
const mockFrom = jest.fn(() => ({
  select: jest.fn(() => ({
    eq: mockEq,
  })),
  update: mockUpdate,
  insert: mockInsert,
}));

jest.mock("@/lib/supabase", () => ({
  createServiceRoleClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

jest.mock("@/lib/email", () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue({ success: true, messageId: "email-123" }),
  sendDigitalDeliveryEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPrintPartnerNotification: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/lib/pricing", () => ({
  getTierById: jest.fn().mockReturnValue({
    id: "digital-basic",
    name: "Digitaal Basis",
    price: 9.99,
    deliveryMethod: "digital",
  }),
}));

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  });

  const createMockRequest = (body: string, signature: string = "test-signature") => {
    return new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": signature,
      },
      body,
    }) as unknown as import("next/server").NextRequest;
  };

  describe("Webhook Configuration", () => {
    it("returns 503 when webhook is not configured", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      
      // Re-import to get fresh module with new env
      jest.resetModules();
      const { POST: POST_NO_SECRET } = await import("@/app/api/webhooks/stripe/route");

      const request = createMockRequest("test-payload");
      const response = await POST_NO_SECRET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.message).toBe("Webhook not configured");
    });

    it("returns 400 when signature is missing", async () => {
      const request = new Request("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "test-payload",
      }) as unknown as import("next/server").NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe("Missing signature");
    });
  });

  describe("Signature Verification", () => {
    it("returns 400 when signature verification fails", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid signature");
      });

      const request = createMockRequest("test-payload");
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe("Invalid signature");
    });
  });

  describe("checkout.session.completed", () => {
    const mockCheckoutSession = {
      id: "cs_test_123",
      object: "checkout.session",
      payment_intent: "pi_test_123",
      metadata: {
        portraitId: "test-portrait-id",
        tierId: "digital-basic",
        customerEmail: "test@example.com",
        petName: "Fluffy",
      },
    };

    const mockEvent = {
      id: "evt_test_123",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: mockCheckoutSession,
      },
    };

    const mockOrder = {
      id: "test-order-id",
      stripe_checkout_session_id: "cs_test_123",
      customer_email: "test@example.com",
      status: "pending",
      amount_total: 9.99,
      portrait_id: "test-portrait-id",
      product_tier: "digital_basic",
    };

    it("successfully processes checkout.session.completed", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockEvent);

      // Mock finding order
      mockSingle.mockResolvedValueOnce({ data: mockOrder, error: null });
      // Mock updating order
      mockEq.mockResolvedValueOnce({ error: null });
      // Mock updating portrait
      mockEq.mockResolvedValueOnce({ error: null });

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("skips already paid orders", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockEvent);

      // Mock finding order with paid status
      mockSingle.mockResolvedValueOnce({ 
        data: { ...mockOrder, status: "paid" }, 
        error: null 
      });

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("returns 500 when order is not found", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockEvent);

      mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it("updates order status to paid", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockEvent);

      mockSingle.mockResolvedValueOnce({ data: mockOrder, error: null });
      mockEq.mockResolvedValueOnce({ error: null });

      const request = createMockRequest(JSON.stringify(mockEvent));
      await POST(request);

      expect(mockFrom).toHaveBeenCalledWith("orders");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "paid",
          stripe_payment_intent_id: "pi_test_123",
          updated_at: expect.any(String),
        })
      );
    });

    it("marks portrait as purchased (removes expiry)", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockEvent);

      mockSingle.mockResolvedValueOnce({ data: mockOrder, error: null });
      mockEq.mockResolvedValueOnce({ error: null });
      mockEq.mockResolvedValueOnce({ error: null });

      const request = createMockRequest(JSON.stringify(mockEvent));
      await POST(request);

      expect(mockFrom).toHaveBeenCalledWith("portraits");
    });

    it("sends order confirmation email", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockEvent);

      mockSingle.mockResolvedValueOnce({ data: mockOrder, error: null });
      mockEq.mockResolvedValueOnce({ error: null });
      mockEq.mockResolvedValueOnce({ error: null });

      const request = createMockRequest(JSON.stringify(mockEvent));
      await POST(request);

      expect(emailModule.sendOrderConfirmation).toHaveBeenCalled();
    });

    it("handles print tier orders correctly", async () => {
      const printEvent = {
        ...mockEvent,
        data: {
          object: {
            ...mockCheckoutSession,
            metadata: { ...mockCheckoutSession.metadata, tierId: "print-digital" },
          },
        },
      };

      (pricingModule.getTierById as jest.Mock).mockReturnValueOnce({
        id: "print-digital",
        name: "Print + Digitaal",
        price: 34.99,
        deliveryMethod: "print",
      });

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(printEvent);

      const printOrder = {
        ...mockOrder,
        product_tier: "print_digital",
      };

      mockSingle.mockResolvedValueOnce({ data: printOrder, error: null });
      mockEq.mockResolvedValueOnce({ error: null });
      mockEq.mockResolvedValueOnce({ error: null });

      const request = createMockRequest(JSON.stringify(printEvent));
      await POST(request);

      expect(emailModule.sendOrderConfirmation).toHaveBeenCalled();
    });
  });

  describe("checkout.session.async_payment_failed", () => {
    const mockFailedEvent = {
      id: "evt_test_failed",
      object: "event",
      type: "checkout.session.async_payment_failed",
      data: {
        object: {
          id: "cs_test_failed",
          metadata: {
            portraitId: "test-portrait-id",
            tierId: "digital-basic",
          },
        },
      },
    };

    const mockOrder = {
      id: "test-order-id",
      stripe_checkout_session_id: "cs_test_failed",
      status: "pending",
    };

    it("updates order status to cancelled on payment failure", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockFailedEvent);

      mockSingle.mockResolvedValueOnce({ data: mockOrder, error: null });
      mockEq.mockResolvedValueOnce({ error: null });

      const request = createMockRequest(JSON.stringify(mockFailedEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "cancelled",
          updated_at: expect.any(String),
        })
      );
    });
  });

  describe("Unhandled event types", () => {
    it("returns 200 for unhandled event types", async () => {
      const unhandledEvent = {
        id: "evt_test_unhandled",
        object: "event",
        type: "customer.created",
        data: { object: { id: "cus_test" } },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(unhandledEvent);

      const request = createMockRequest(JSON.stringify(unhandledEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Event type not handled");
    });
  });

  describe("Error Handling", () => {
    it("handles database errors gracefully", async () => {
      const mockEvent = {
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            payment_intent: "pi_test_123",
            metadata: { portraitId: "test-portrait-id", tierId: "digital-basic" },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(mockEvent);

      mockSingle.mockRejectedValueOnce(new Error("Database connection failed"));

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});

describe("OPTIONS /api/webhooks/stripe", () => {
  it("returns 204 with CORS headers", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(response.headers.get("Access-Control-Allow-Headers")).toContain("Stripe-Signature");
  });
});
