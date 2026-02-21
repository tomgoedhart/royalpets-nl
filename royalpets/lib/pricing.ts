export type TierId = "digital-basic" | "digital-premium" | "print-digital" | "canvas-deluxe";

export interface PricingTier {
  id: TierId;
  name: string;
  price: number;
  priceFormatted: string;
  description: string;
  features: string[];
  isPopular: boolean;
  deliveryMethod: "digital" | "print" | "canvas";
  includesPrint: boolean;
  includesHighRes: boolean;
  includesSourceFile: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "digital-basic",
    name: "Digitaal Basis",
    price: 9.99,
    priceFormatted: "€9.99",
    description: "Perfect voor sociale media en digitale gebruik",
    features: [
      "1 high-res portret (2048x2048)",
      "Zonder watermerk",
      "Directe download",
      "Levenslange toegang",
    ],
    isPopular: false,
    deliveryMethod: "digital",
    includesPrint: false,
    includesHighRes: true,
    includesSourceFile: false,
  },
  {
    id: "digital-premium",
    name: "Digitaal Premium",
    price: 19.99,
    priceFormatted: "€19.99",
    description: "Alle digitale bestanden voor maximale flexibiliteit",
    features: [
      "4 high-res portretten (4096x4096)",
      "Zonder watermerk",
      "Bronbestand (PNG + PSD)",
      "Directe download",
      "Levenslange toegang",
      "Commercieel gebruik",
    ],
    isPopular: true,
    deliveryMethod: "digital",
    includesPrint: false,
    includesHighRes: true,
    includesSourceFile: true,
  },
  {
    id: "print-digital",
    name: "Print + Digitaal",
    price: 34.99,
    priceFormatted: "€34.99",
    description: "Gedrukt portret op hoogwaardig papier",
    features: [
      "Premium print op 300gsm papier",
      "Formaat: 30x30cm",
      "Inclusief passe-partout",
      "Gratis verzending NL",
      "Alle digitale bestanden",
      "Geschenkverpakking",
    ],
    isPopular: false,
    deliveryMethod: "print",
    includesPrint: true,
    includesHighRes: true,
    includesSourceFile: true,
  },
  {
    id: "canvas-deluxe",
    name: "Canvas Deluxe",
    price: 59.99,
    priceFormatted: "€59.99",
    description: "Museumkwaliteit canvas voor de ultieme uitstraling",
    features: [
      "Premium canvas op houten frame",
      "Formaat: 40x40cm",
      "UV-bestendige inkt",
      "Klaar om op te hangen",
      "Gratis verzending NL",
      "Alle digitale bestanden",
      "Geschenkverpakking",
      "5 jaar garantie",
    ],
    isPopular: false,
    deliveryMethod: "canvas",
    includesPrint: true,
    includesHighRes: true,
    includesSourceFile: true,
  },
];

export function getTierById(id: TierId): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.id === id);
}

export function getPopularTier(): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.isPopular);
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2).replace(".", ",")}`;
}
