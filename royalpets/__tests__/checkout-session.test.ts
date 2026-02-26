/**
 * @jest-environment node
 */

import { POST, OPTIONS } from "@/app/api/checkout/session/route";
import { stripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase";

// Mock dependencies
jest.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
  isStripeConfigured: jest.fn().mockReturnValue(true),
  calculatePriceWithBTW: jest.fn().mockReturnValue({
    subtotal: 8.26,
    taxAmount: 1.73,
    total: 9.99,
  }),
  getTierProductName: jest.fn().mockReturnValue("Digitaal Basis"),
  getTierProductDescription: jest.fn().mockReturnValue("1 high-res portret"),
  isValidTierId: jest.fn().mockImplementation((id: string) => 
    ["digital-basic", "digital-premium", "print-digital", "canvas-deluxe"].includes(id)
  ),
  tierIdToDatabaseEnum: jest.fn().mockReturnValue("digital_basic"),
}));

jest.mock("@/lib/supabase", () => ({
  createServiceRoleClient: jest.fn(),
}));

jest.mock("@/lib/pricing", () => ({
  getTierById: jest.fn().mockImplementation((id: string) => {
    const tiers: Record<string, { id: string; price: number; name: string }> = {
      "digital-basic": { id: "digital-basic", price: 9.99, name: "Digitaal Basis" },
      "digital-premium": { id: "digital-premium", price: 19.99, name: "Digitaal Premium" },
      "print-digital": { id: "print-digital", price: 34.99, name: "Print + Digitaal" },
      "canvas-deluxe": { id: "canvas-deluxe", price: 59.99, name: "Canvas Deluxe" },
    };
    return tiers[id] || null;
  }),
}));

describe("POST /api/checkout/session", () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  const createMockRequest = (body: unknown) => {
    return new Request("http://localhost:3000/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as unknown as import("next/server").NextRequest;
  };

  it("returns 503 when Stripe is not configured", async () => {
    const { isStripeConfigured } = require("@/lib/stripe");
    (isStripeConfigured as jest.Mock).mockReturnValueOnce(false);

    const request = createMockRequest({
      tierId: "digital-basic",
      portraitId: "test-portrait-id",
      customerEmail: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Payment service not configured");
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost:3000/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    }) as unknown as import("next/server").NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Invalid JSON in request body");
  });

  it("returns 400 for missing tierId", async () => {
    const request = createMockRequest({
      portraitId: "test-portrait-id",
      customerEmail: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toContain("tierId is required and must be a string");
  });

  it("returns 400 for invalid tierId", async () => {
    const { isValidTierId } = require("@/lib/stripe");
    (isValidTierId as jest.Mock).mockReturnValueOnce(false);

    const request = createMockRequest({
      tierId: "invalid-tier",
      portraitId: "test-portrait-id",
      customerEmail: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toContain("Invalid tierId: invalid-tier");
  });

  it("returns 400 for missing portraitId", async () => {
    const request = createMockRequest({
      tierId: "digital-basic",
      customerEmail: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toContain("portraitId is required and must be a string");
  });

  it("returns 400 for missing customerEmail", async () => {
    const request = createMockRequest({
      tierId: "digital-basic",
      portraitId: "test-portrait-id",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toContain("customerEmail is required and must be a string");
  });

  it("returns 400 for invalid email", async () => {
    const request = createMockRequest({
      tierId: "digital-basic",
      portraitId: "test-portrait-id",
      customerEmail: "invalid-email",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toContain("customerEmail must be a valid email address");
  });

  it("returns 400 when portrait is not found", async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: "Not found" },
    });

    const request = createMockRequest({
      tierId: "digital-basic",
      portraitId: "non-existent-id",
      customerEmail: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Portrait not found");
  });

  it("returns 400 when portrait generation is not completed", async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: "test-portrait-id",
        status: "generating",
        generated_images: [],
      },
      error: null,
    });

    const request = createMockRequest({
      tierId: "digital-basic",
      portraitId: "test-portrait-id",
      customerEmail: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Portrait generation not completed");
  });

  it("creates checkout session successfully", async () => {
    const mockPortrait = {
      id: "test-portrait-id",
      status: "completed",
      generated_images: [
        { index: 0, url: "https://example.com/image1.png", path: "portraits/image1.png" },
        { index: 1, url: "https://example.com/image2.png", path: "portraits/image2.png" },
      ],
      selected_image_index: 0,
      costume_id: "koning",
      pet_name: "Fluffy",
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockPortrait,
      error: null,
    });

    mockSupabase.single.mockResolvedValueOnce({
      data: { id: "test-order-id" },
      error: null,
    });

    const mockSession = {
      id: "cs_test_123",
      url: "https://checkout.stripe.com/test",
    };

    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValueOnce(mockSession);

    const request = createMockRequest({
      tierId: "digital-basic",
      portraitId: "test-portrait-id",
      customerEmail: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sessionId).toBe("cs_test_123");
    expect(data.checkoutUrl).toBe("https://checkout.stripe.com/test");

    // Verify Stripe session was created with correct parameters
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_method_types: ["ideal", "card"],
        customer_email: "test@example.com",
        mode: "payment",
        locale: "nl",
        metadata: expect.objectContaining({
          portraitId: "test-portrait-id",
          tierId: "digital-basic",
          customerEmail: "test@example.com",
        }),
      })
    );

    // Verify order was created in database
    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        portrait_id: "test-portrait-id",
        customer_email: "test@example.com",
        product_tier: "digital_basic",
        currency: "eur",
        status: "pending",
      })
    );
  });

  it("creates checkout session with iDEAL and card payment methods", async () => {
    const mockPortrait = {
      id: "test-portrait-id",
      status: "completed",
      generated_images: [{ index: 0, url: "https://example.com/image.png", path: "portraits/image.png" }],
      selected_image_index: null,
      costume_id: null,
      pet_name: null,
    };

    mockSupabase.single
      .mockResolvedValueOnce({ data: mockPortrait, error: null })
      .mockResolvedValueOnce({ data: { id: "order-id" }, error: null });

    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValueOnce({
      id: "cs_test",
      url: "https://checkout.stripe.com/test",
    });

    const request = createMockRequest({
      tierId: "digital-basic",
      portraitId: "test-portrait-id",
      customerEmail: "test@example.com",
    });

    await POST(request);

    const createCall = (stripe.checkout.sessions.create as jest.Mock).mock.calls[0][0];
    expect(createCall.payment_method_types).toContain("ideal");
    expect(createCall.payment_method_types).toContain("card");
  });

  it("calculates correct price for each tier", async () => {
    const { getTierById } = require("@/lib/pricing");
    const { calculatePriceWithBTW } = require("@/lib/stripe");

    const mockPortrait = {
      id: "test-portrait-id",
      status: "completed",
      generated_images: [{ index: 0, url: "https://example.com/image.png", path: "portraits/image.png" }],
      selected_image_index: 0,
      costume_id: null,
      pet_name: null,
    };

    const tiers = [
      { id: "digital-basic", price: 9.99 },
      { id: "digital-premium", price: 19.99 },
      { id: "print-digital", price: 34.99 },
      { id: "canvas-deluxe", price: 59.99 },
    ];

    for (const tier of tiers) {
      jest.clearAllMocks();
      
      (getTierById as jest.Mock).mockReturnValueOnce(tier);
      
      mockSupabase.single
        .mockResolvedValueOnce({ data: mockPortrait, error: null })
        .mockResolvedValueOnce({ data: { id: "order-id" }, error: null });

      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValueOnce({
        id: "cs_test",
        url: "https://checkout.stripe.com/test",
      });

      const request = createMockRequest({
        tierId: tier.id,
        portraitId: "test-portrait-id",
        customerEmail: "test@example.com",
      });

      await POST(request);

      // Verify price calculation was called
      expect(calculatePriceWithBTW).toHaveBeenCalledWith(tier.price);
      
      // Verify Stripe amount is in cents
      const createCall = (stripe.checkout.sessions.create as jest.Mock).mock.calls[0][0];
      expect(createCall.line_items[0].price_data.unit_amount).toBe(Math.round(tier.price * 100));
    }
  });

  it("returns 500 on Stripe API error", async () => {
    const mockPortrait = {
      id: "test-portrait-id",
      status: "completed",
      generated_images: [{ index: 0, url: "https://example.com/image.png", path: "portraits/image.png" }],
      selected_image_index: 0,
      costume_id: null,
      pet_name: null,
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockPortrait,
      error: null,
    });

    (stripe.checkout.sessions.create as jest.Mock).mockRejectedValueOnce(
      new Error("Stripe API error")
    );

    const request = createMockRequest({
      tierId: "digital-basic",
      portraitId: "test-portrait-id",
      customerEmail: "test@example.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Stripe API error");
  });
});

describe("OPTIONS /api/checkout/session", () => {
  it("returns 204 with CORS headers", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });
});
