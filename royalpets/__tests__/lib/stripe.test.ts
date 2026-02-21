import { stripe, isStripeConfigured, calculatePriceWithBTW, getTierProductName, getTierProductDescription, isValidTierId, tierIdToDatabaseEnum, BTW_RATE } from "@/lib/stripe";

// Mock the environment variables
const originalEnv = process.env;

describe("lib/stripe", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("isStripeConfigured", () => {
    it("returns true when both keys are set", () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_key";
      process.env.STRIPE_PUBLISHABLE_KEY = "pk_test_key";
      
      // Re-import to get fresh check
      const { isStripeConfigured: check } = require("@/lib/stripe");
      expect(check()).toBe(true);
    });

    it("returns false when secret key is missing", () => {
      process.env.STRIPE_SECRET_KEY = "";
      process.env.STRIPE_PUBLISHABLE_KEY = "pk_test_key";
      
      const { isStripeConfigured: check } = require("@/lib/stripe");
      expect(check()).toBe(false);
    });

    it("returns false when publishable key is missing", () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_key";
      process.env.STRIPE_PUBLISHABLE_KEY = "";
      
      const { isStripeConfigured: check } = require("@/lib/stripe");
      expect(check()).toBe(false);
    });
  });

  describe("calculatePriceWithBTW", () => {
    it("calculates correct BTW for digital-basic tier (€9.99)", () => {
      const result = calculatePriceWithBTW(9.99);
      
      // €9.99 incl. 21% BTW = €8.26 excl. + €1.73 BTW
      expect(result.total).toBe(9.99);
      expect(result.subtotal).toBeCloseTo(8.26, 2);
      expect(result.taxAmount).toBeCloseTo(1.73, 2);
      expect(result.subtotal + result.taxAmount).toBeCloseTo(9.99, 2);
    });

    it("calculates correct BTW for digital-premium tier (€19.99)", () => {
      const result = calculatePriceWithBTW(19.99);
      
      expect(result.total).toBe(19.99);
      expect(result.subtotal).toBeCloseTo(16.52, 2);
      expect(result.taxAmount).toBeCloseTo(3.47, 2);
    });

    it("calculates correct BTW for canvas-deluxe tier (€59.99)", () => {
      const result = calculatePriceWithBTW(59.99);
      
      expect(result.total).toBe(59.99);
      expect(result.subtotal).toBeCloseTo(49.58, 2);
      expect(result.taxAmount).toBeCloseTo(10.41, 2);
    });

    it("uses correct BTW rate of 21%", () => {
      expect(BTW_RATE).toBe(0.21);
    });
  });

  describe("getTierProductName", () => {
    it("returns correct name for digital-basic", () => {
      expect(getTierProductName("digital-basic")).toBe("Digitaal Basis");
    });

    it("returns correct name for digital-premium", () => {
      expect(getTierProductName("digital-premium")).toBe("Digitaal Premium");
    });

    it("returns correct name for print-digital", () => {
      expect(getTierProductName("print-digital")).toBe("Print + Digitaal");
    });

    it("returns correct name for canvas-deluxe", () => {
      expect(getTierProductName("canvas-deluxe")).toBe("Canvas Deluxe");
    });

    it("returns 'Onbekend Product' for unknown tier", () => {
      expect(getTierProductName("unknown-tier")).toBe("Onbekend Product");
    });
  });

  describe("getTierProductDescription", () => {
    it("returns description for digital-basic", () => {
      expect(getTierProductDescription("digital-basic")).toContain("2048x2048");
    });

    it("returns description for digital-premium", () => {
      expect(getTierProductDescription("digital-premium")).toContain("4096x4096");
    });

    it("returns description for print-digital", () => {
      expect(getTierProductDescription("print-digital")).toContain("30x30cm");
    });

    it("returns description for canvas-deluxe", () => {
      expect(getTierProductDescription("canvas-deluxe")).toContain("40x40cm");
    });

    it("returns default description for unknown tier", () => {
      expect(getTierProductDescription("unknown")).toBe("Koninklijk huisdierportret");
    });
  });

  describe("isValidTierId", () => {
    it("returns true for valid tier IDs", () => {
      expect(isValidTierId("digital-basic")).toBe(true);
      expect(isValidTierId("digital-premium")).toBe(true);
      expect(isValidTierId("print-digital")).toBe(true);
      expect(isValidTierId("canvas-deluxe")).toBe(true);
    });

    it("returns false for invalid tier IDs", () => {
      expect(isValidTierId("invalid")).toBe(false);
      expect(isValidTierId("")).toBe(false);
      expect(isValidTierId("free")).toBe(false);
    });
  });

  describe("tierIdToDatabaseEnum", () => {
    it("converts digital-basic to database format", () => {
      expect(tierIdToDatabaseEnum("digital-basic")).toBe("digital_basic");
    });

    it("converts digital-premium to database format", () => {
      expect(tierIdToDatabaseEnum("digital-premium")).toBe("digital_premium");
    });

    it("converts print-digital to database format", () => {
      expect(tierIdToDatabaseEnum("print-digital")).toBe("print_digital");
    });

    it("converts canvas-deluxe to database format", () => {
      expect(tierIdToDatabaseEnum("canvas-deluxe")).toBe("canvas_deluxe");
    });

    it("returns digital_basic for unknown tier as fallback", () => {
      expect(tierIdToDatabaseEnum("unknown")).toBe("digital_basic");
    });
  });
});
