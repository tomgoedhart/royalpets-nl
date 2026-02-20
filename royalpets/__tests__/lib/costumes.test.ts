import {
  costumes,
  categories,
  getCostumesByCategory,
  getCostumeById,
  type CostumeCategory,
} from "@/lib/costumes";

describe("Costume Data", () => {
  describe("costumes array", () => {
    it("should have exactly 8 costumes", () => {
      expect(costumes).toHaveLength(8);
    });

    it("should have unique ids", () => {
      const ids = costumes.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have all required fields for each costume", () => {
      costumes.forEach((costume) => {
        expect(costume).toHaveProperty("id");
        expect(costume).toHaveProperty("name");
        expect(costume).toHaveProperty("category");
        expect(costume).toHaveProperty("description");
        expect(costume).toHaveProperty("prompt");
        expect(costume).toHaveProperty("icon");
      });
    });

    it("should have valid categories", () => {
      const validCategories: CostumeCategory[] = [
        "Koninklijk",
        "Militair",
        "Renaissance",
      ];
      costumes.forEach((costume) => {
        expect(validCategories).toContain(costume.category);
      });
    });

    it("should have the expected costume names", () => {
      const expectedNames = [
        "Koning",
        "Koningin",
        "Prinses",
        "Ridder",
        "Admiraal",
        "Generaal",
        "Hertog",
        "Gravin",
      ];
      const actualNames = costumes.map((c) => c.name);
      expectedNames.forEach((name) => {
        expect(actualNames).toContain(name);
      });
    });
  });

  describe("categories array", () => {
    it("should have exactly 3 categories", () => {
      expect(categories).toHaveLength(3);
    });

    it("should contain the expected categories", () => {
      expect(categories).toContain("Koninklijk");
      expect(categories).toContain("Militair");
      expect(categories).toContain("Renaissance");
    });
  });

  describe("getCostumesByCategory", () => {
    it("should return costumes filtered by Koninklijk category", () => {
      const result = getCostumesByCategory("Koninklijk");
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.name)).toEqual([
        "Koning",
        "Koningin",
        "Prinses",
      ]);
    });

    it("should return costumes filtered by Militair category", () => {
      const result = getCostumesByCategory("Militair");
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.name)).toEqual([
        "Ridder",
        "Admiraal",
        "Generaal",
      ]);
    });

    it("should return costumes filtered by Renaissance category", () => {
      const result = getCostumesByCategory("Renaissance");
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.name)).toEqual(["Hertog", "Gravin"]);
    });
  });

  describe("getCostumeById", () => {
    it("should return the correct costume for valid id", () => {
      const costume = getCostumeById("koning");
      expect(costume).toBeDefined();
      expect(costume?.name).toBe("Koning");
    });

    it("should return undefined for invalid id", () => {
      const costume = getCostumeById("invalid-id");
      expect(costume).toBeUndefined();
    });

    it("should return all costumes by their ids", () => {
      const ids = ["koning", "koningin", "prinses", "ridder", "admiraal", "generaal", "hertog", "gravin"];
      ids.forEach((id) => {
        const costume = getCostumeById(id);
        expect(costume).toBeDefined();
        expect(costume?.id).toBe(id);
      });
    });
  });
});
