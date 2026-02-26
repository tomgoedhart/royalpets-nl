import { pricingTiers, getTierById, getPopularTier, formatPrice, type TierId } from "@/lib/pricing";

describe("pricing", () => {
  describe("pricingTiers", () => {
    it("should have exactly 4 tiers", () => {
      expect(pricingTiers).toHaveLength(4);
    });

    it("should have the correct tier IDs", () => {
      const expectedIds: TierId[] = [
        "digital-basic",
        "digital-premium",
        "print-digital",
        "canvas-deluxe",
      ];
      const actualIds = pricingTiers.map((tier) => tier.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it("should have the correct prices", () => {
      expect(pricingTiers[0].price).toBe(9.99);
      expect(pricingTiers[1].price).toBe(19.99);
      expect(pricingTiers[2].price).toBe(34.99);
      expect(pricingTiers[3].price).toBe(59.99);
    });

    it("should have formatted prices", () => {
      expect(pricingTiers[0].priceFormatted).toBe("€9.99");
      expect(pricingTiers[1].priceFormatted).toBe("€19.99");
      expect(pricingTiers[2].priceFormatted).toBe("€34.99");
      expect(pricingTiers[3].priceFormatted).toBe("€59.99");
    });

    it("should have Dutch names", () => {
      expect(pricingTiers[0].name).toBe("Digitaal Basis");
      expect(pricingTiers[1].name).toBe("Digitaal Premium");
      expect(pricingTiers[2].name).toBe("Print + Digitaal");
      expect(pricingTiers[3].name).toBe("Canvas Deluxe");
    });

    it("should have exactly one popular tier", () => {
      const popularTiers = pricingTiers.filter((tier) => tier.isPopular);
      expect(popularTiers).toHaveLength(1);
      expect(popularTiers[0].id).toBe("digital-premium");
    });

    it("should have correct delivery methods", () => {
      expect(pricingTiers[0].deliveryMethod).toBe("digital");
      expect(pricingTiers[1].deliveryMethod).toBe("digital");
      expect(pricingTiers[2].deliveryMethod).toBe("print");
      expect(pricingTiers[3].deliveryMethod).toBe("canvas");
    });

    it("should have correct includesPrint flags", () => {
      expect(pricingTiers[0].includesPrint).toBe(false);
      expect(pricingTiers[1].includesPrint).toBe(false);
      expect(pricingTiers[2].includesPrint).toBe(true);
      expect(pricingTiers[3].includesPrint).toBe(true);
    });

    it("should have correct includesHighRes flags", () => {
      expect(pricingTiers[0].includesHighRes).toBe(true);
      expect(pricingTiers[1].includesHighRes).toBe(true);
      expect(pricingTiers[2].includesHighRes).toBe(true);
      expect(pricingTiers[3].includesHighRes).toBe(true);
    });

    it("should have correct includesSourceFile flags", () => {
      expect(pricingTiers[0].includesSourceFile).toBe(false);
      expect(pricingTiers[1].includesSourceFile).toBe(true);
      expect(pricingTiers[2].includesSourceFile).toBe(true);
      expect(pricingTiers[3].includesSourceFile).toBe(true);
    });

    it("should have features for each tier", () => {
      pricingTiers.forEach((tier) => {
        expect(tier.features).toBeDefined();
        expect(tier.features.length).toBeGreaterThan(0);
      });
    });

    it("should have descriptions for each tier", () => {
      pricingTiers.forEach((tier) => {
        expect(tier.description).toBeDefined();
        expect(tier.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getTierById", () => {
    it("should return the correct tier by ID", () => {
      const tier = getTierById("digital-basic");
      expect(tier).toBeDefined();
      expect(tier?.name).toBe("Digitaal Basis");
    });

    it("should return digital-premium tier", () => {
      const tier = getTierById("digital-premium");
      expect(tier).toBeDefined();
      expect(tier?.name).toBe("Digitaal Premium");
    });

    it("should return print-digital tier", () => {
      const tier = getTierById("print-digital");
      expect(tier).toBeDefined();
      expect(tier?.name).toBe("Print + Digitaal");
    });

    it("should return canvas-deluxe tier", () => {
      const tier = getTierById("canvas-deluxe");
      expect(tier).toBeDefined();
      expect(tier?.name).toBe("Canvas Deluxe");
    });

    it("should return undefined for invalid ID", () => {
      const tier = getTierById("invalid-id" as TierId);
      expect(tier).toBeUndefined();
    });
  });

  describe("getPopularTier", () => {
    it("should return the popular tier", () => {
      const tier = getPopularTier();
      expect(tier).toBeDefined();
      expect(tier?.isPopular).toBe(true);
      expect(tier?.id).toBe("digital-premium");
    });
  });

  describe("formatPrice", () => {
    it("should format price with euro sign", () => {
      expect(formatPrice(9.99)).toBe("€9,99");
      expect(formatPrice(19.99)).toBe("€19,99");
      expect(formatPrice(34.99)).toBe("€34,99");
      expect(formatPrice(59.99)).toBe("€59,99");
    });

    it("should format whole numbers correctly", () => {
      expect(formatPrice(10)).toBe("€10,00");
      expect(formatPrice(100)).toBe("€100,00");
    });

    it("should use comma as decimal separator", () => {
      const formatted = formatPrice(9.99);
      expect(formatted).toContain(",");
      expect(formatted).not.toContain(".");
    });
  });
});
