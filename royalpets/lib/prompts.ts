/**
 * Costume prompt templates for AI image generation
 * These prompts are optimized for GPT-4o/DALL-E 3 to generate royal pet portraits
 */

export interface CostumePromptTemplate {
  id: string;
  name: string;
  category: "royal" | "military" | "renaissance";
  description: string;
  basePrompt: string;
  styleModifiers: string[];
}

// Base style that applies to all portraits
const BASE_PORTRAIT_STYLE = `
Professional pet portrait photography style, 
majestic and dignified pose, 
highly detailed fur texture,
soft studio lighting with rim light,
neutral gradient background,
4K quality, photorealistic,
respect the original pet's features, coloring, and expression
`.trim().replace(/\s+/g, " ");

/**
 * Generate a complete prompt for a costume
 * @param costumeId - The costume identifier
 * @param petType - Type of pet (dog, cat, other)
 * @param petName - Optional pet name for personalization
 * @returns Complete prompt string
 */
export function generateCostumePrompt(
  costumeId: string,
  petType: "dog" | "cat" | "other" = "dog",
  petName?: string
): string {
  const template = COSTUME_TEMPLATES[costumeId];
  
  if (!template) {
    // Fallback to a generic royal portrait
    return generateGenericRoyalPrompt(petType, petName);
  }

  const petTypeDescription = getPetTypeDescription(petType);
  const namePrefix = petName ? `Portrait of ${petName}, a ` : "Portrait of a ";
  
  const prompt = `${namePrefix}${petTypeDescription} ${template.basePrompt}. ${BASE_PORTRAIT_STYLE}`;
  
  return prompt;
}

/**
 * Get pet type description for prompts
 */
function getPetTypeDescription(petType: "dog" | "cat" | "other"): string {
  switch (petType) {
    case "dog":
      return "regal dog";
    case "cat":
      return "majestic cat";
    case "other":
      return "noble pet";
    default:
      return "regal pet";
  }
}

/**
 * Generate a generic royal portrait prompt as fallback
 */
function generateGenericRoyalPrompt(
  petType: "dog" | "cat" | "other" = "dog",
  petName?: string
): string {
  const petTypeDescription = getPetTypeDescription(petType);
  const namePrefix = petName ? `Portrait of ${petName}, a ` : "Portrait of a ";
  
  return `${namePrefix}${petTypeDescription} wearing an elegant royal outfit with gold accents, sitting proudly like royalty. ${BASE_PORTRAIT_STYLE}`;
}

/**
 * Costume prompt templates database
 */
export const COSTUME_TEMPLATES: Record<string, CostumePromptTemplate> = {
  // Royal costumes
  koning: {
    id: "koning",
    name: "Koning",
    category: "royal",
    description: "Een majestueuze koning met gouden kroon en koningsmantel",
    basePrompt: `
      wearing a magnificent golden crown adorned with rubies and sapphires,
      draped in a luxurious red velvet robe with white ermine trim and golden embroidery,
      holding a golden scepter,
      seated on an ornate throne with velvet cushions,
      expression of noble authority and wisdom
    `.trim().replace(/\s+/g, " "),
    styleModifiers: ["regal", "majestic", "authoritative"],
  },
  
  koningin: {
    id: "koningin",
    name: "Koningin",
    category: "royal",
    description: "Een elegante koningin met tiara en koninklijke gewaden",
    basePrompt: `
      wearing a delicate diamond and pearl tiara that sparkles in the light,
      dressed in an elegant gown of royal purple silk with silver embroidery,
      adorned with a pearl necklace and matching earrings,
      graceful and dignified posture,
      expression of kind authority and elegance
    `.trim().replace(/\s+/g, " "),
    styleModifiers: ["elegant", "graceful", "refined"],
  },
  
  prinses: {
    id: "prinses",
    name: "Prinses",
    category: "royal",
    description: "Een charmante prinses met tiara en baljurk",
    basePrompt: `
      wearing a charming silver tiara decorated with small flowers and gems,
      dressed in a flowing pastel pink ball gown with satin ribbons and rose details,
      playful yet graceful pose,
      expression of youthful charm and sweetness
    `.trim().replace(/\s+/g, " "),
    styleModifiers: ["charming", "youthful", "sweet"],
  },
  
  // Military costumes
  ridder: {
    id: "ridder",
    name: "Ridder",
    category: "military",
    description: "Een dapper ridder in glanzend harnas",
    basePrompt: `
      wearing shining plate armor with a family crest engraved on the chest,
      a red velvet cape draped over one shoulder,
      holding a ceremonial sword with jeweled hilt,
      heroic and brave stance,
      expression of courage and honor
    `.trim().replace(/\s+/g, " "),
    styleModifiers: ["heroic", "brave", "noble"],
  },
  
  admiraal: {
    id: "admiraal",
    name: "Admiraal",
    category: "military",
    description: "Een bevelvoerende admiraal in marineuniform",
    basePrompt: `
      wearing an ornate navy blue uniform with gold epaulettes and brass buttons,
      decorated with medals and ribbons on the chest,
      a captain's hat with golden emblem,
      commanding and confident posture,
      expression of leadership and experience
    `.trim().replace(/\s+/g, " "),
    styleModifiers: ["commanding", "distinguished", "authoritative"],
  },
  
  generaal: {
    id: "generaal",
    name: "Generaal",
    category: "military",
    description: "Een autoritaire generaal in ceremonieel uniform",
    basePrompt: `
      wearing a decorated ceremonial military uniform in deep green with gold braid,
      adorned with medals, sashes, and insignia,
      a bicorne hat with feather plume,
      authoritative and composed stance,
      expression of strategic wisdom and power
    `.trim().replace(/\s+/g, " "),
    styleModifiers: ["authoritative", "strategic", "powerful"],
  },
  
  // Renaissance costumes
  hertog: {
    id: "hertog",
    name: "Hertog",
    category: "renaissance",
    description: "Een verfijnde hertog in renaissance kledij",
    basePrompt: `
      wearing an elaborate Renaissance doublet in rich burgundy velvet with gold buttons,
      a white ruffled collar (millstone collar),
      adorned with gold chains and a medallion,
      sophisticated and cultured pose,
      expression of refined intellect and status
    `.trim().replace(/\s+/g, " "),
    styleModifiers: ["sophisticated", "cultured", "refined"],
  },
  
  gravin: {
    id: "gravin",
    name: "Gravin",
    category: "renaissance",
    description: "Een statige gravin in renaissance jurk",
    basePrompt: `
      wearing an elaborate Renaissance gown with a structured bodice and full skirt in emerald green,
      delicate lace cuffs and collar,
      adorned with pearls and a cameo brooch,
      dignified and graceful posture,
      expression of noble elegance and poise
    `.trim().replace(/\s+/g, " "),
    styleModifiers: ["dignified", "elegant", "stately"],
  },
};

/**
 * Get all available costume IDs
 */
export function getCostumeIds(): string[] {
  return Object.keys(COSTUME_TEMPLATES);
}

/**
 * Check if a costume ID exists
 */
export function isValidCostumeId(costumeId: string): boolean {
  return costumeId in COSTUME_TEMPLATES;
}

/**
 * Get costume template by ID
 */
export function getCostumeTemplate(costumeId: string): CostumePromptTemplate | null {
  return COSTUME_TEMPLATES[costumeId] || null;
}
