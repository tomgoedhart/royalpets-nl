export type CostumeCategory = "Koninklijk" | "Militair" | "Renaissance";

export interface Costume {
  id: string;
  name: string;
  category: CostumeCategory;
  description: string;
  prompt: string;
  icon: string;
}

export const costumes: Costume[] = [
  // Koninklijk
  {
    id: "koning",
    name: "Koning",
    category: "Koninklijk",
    description: "Een majestueuze koning met gouden kroon en koningsmantel",
    prompt: "Royal king portrait, wearing a golden crown with jewels, red velvet robe with ermine trim, majestic pose, regal background with throne",
    icon: "Crown",
  },
  {
    id: "koningin",
    name: "Koningin",
    category: "Koninklijk",
    description: "Een elegante koningin met tiara en koninklijke gewaden",
    prompt: "Royal queen portrait, wearing a diamond tiara, elegant gown with pearls and lace, graceful pose, royal palace background",
    icon: "Gem",
  },
  {
    id: "prinses",
    name: "Prinses",
    category: "Koninklijk",
    description: "Een charmante prinses met tiara en baljurk",
    prompt: "Royal princess portrait, wearing a delicate tiara, flowing ball gown with ribbons and flowers, youthful and charming, castle ballroom background",
    icon: "Sparkles",
  },
  // Militair
  {
    id: "ridder",
    name: "Ridder",
    category: "Militair",
    description: "Een dapper ridder in glanzend harnas",
    prompt: "Medieval knight portrait, wearing shining plate armor with family crest, holding sword, heroic stance, castle courtyard background",
    icon: "Shield",
  },
  {
    id: "admiraal",
    name: "Admiraal",
    category: "Militair",
    description: "Een bevelvoerende admiraal in marineuniform",
    prompt: "Naval admiral portrait, wearing ornate navy uniform with gold epaulettes and medals, commanding presence, ship deck background with ocean",
    icon: "Anchor",
  },
  {
    id: "generaal",
    name: "Generaal",
    category: "Militair",
    description: "Een autoritaire generaal in ceremonieel uniform",
    prompt: "Military general portrait, wearing decorated ceremonial uniform with medals and sash, authoritative pose, military headquarters background",
    icon: "Sword",
  },
  // Renaissance
  {
    id: "hertog",
    name: "Hertog",
    category: "Renaissance",
    description: "Een verfijnde hertog in renaissance kledij",
    prompt: "Renaissance duke portrait, wearing elaborate doublet and ruffled collar, rich fabrics and jewelry, sophisticated pose, Renaissance palace background",
    icon: "Scroll",
  },
  {
    id: "gravin",
    name: "Gravin",
    category: "Renaissance",
    description: "Een statige gravin in renaissance jurk",
    prompt: "Renaissance countess portrait, wearing elaborate Renaissance gown with bodice and full skirt, pearl necklace, dignified pose, Italian villa background",
    icon: "Flower2",
  },
];

export const categories: CostumeCategory[] = ["Koninklijk", "Militair", "Renaissance"];

export function getCostumesByCategory(category: CostumeCategory): Costume[] {
  return costumes.filter((costume) => costume.category === category);
}

export function getCostumeById(id: string): Costume | undefined {
  return costumes.find((costume) => costume.id === id);
}
