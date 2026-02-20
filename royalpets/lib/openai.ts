import OpenAI from "openai";

// OpenAI API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validate environment variables
if (!OPENAI_API_KEY) {
  console.warn(
    "OPENAI_API_KEY not configured. AI generation will not work."
  );
}

// Create OpenAI client
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || "",
  maxRetries: 3,
  timeout: 120000, // 2 minutes timeout for image generation
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
});

// Check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 10000;

// Exponential backoff delay calculation
function getRetryDelay(attempt: number): number {
  const delay = Math.min(
    INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt),
    MAX_RETRY_DELAY_MS
  );
  // Add random jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GenerateImageOptions {
  prompt: string;
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "standard" | "high";
  style?: "vivid" | "natural";
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

/**
 * Generate an image using OpenAI's GPT-4o Image API (DALL-E 3)
 * @param options - Generation options including prompt
 * @returns GeneratedImage with URL and revised prompt
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const { prompt, size = "1024x1024", quality = "standard", style = "vivid" } = options;

  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API not configured");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        size,
        quality,
        style,
        n: 1,
        response_format: "url",
      });

      const imageData = response.data?.[0];
      const imageUrl = imageData?.url;
      if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI");
      }

      return {
        url: imageUrl,
        revisedPrompt: imageData?.revised_prompt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx) except for rate limits (429)
      if (error instanceof OpenAI.APIError) {
        if (error.status && error.status >= 400 && error.status < 500) {
          if (error.status !== 429) {
            throw error;
          }
        }
      }

      // If this is the last attempt, throw the error
      if (attempt === MAX_RETRIES - 1) {
        throw new Error(
          `Failed to generate image after ${MAX_RETRIES} attempts: ${lastError.message}`
        );
      }

      // Wait before retrying
      const delay = getRetryDelay(attempt);
      console.warn(
        `OpenAI API attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
        lastError.message
      );
      await sleep(delay);
    }
  }

  throw lastError || new Error("Unknown error during image generation");
}

/**
 * Generate multiple image variations
 * @param prompt - Base prompt for generation
 * @param count - Number of variations to generate (default: 4)
 * @returns Array of GeneratedImage
 */
export async function generateImageVariations(
  prompt: string,
  count: number = 4
): Promise<GeneratedImage[]> {
  // Add slight variations to each prompt for diversity
  const variations = [
    prompt,
    `${prompt} with a slightly different artistic interpretation`,
    `${prompt}, alternative composition`,
    `${prompt}, varied lighting and mood`,
  ].slice(0, count);

  const results: GeneratedImage[] = [];
  
  // Generate images sequentially to avoid rate limiting
  for (let i = 0; i < variations.length; i++) {
    try {
      const result = await generateImage({
        prompt: variations[i],
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to generate variation ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Download image from URL as buffer
 * @param url - Image URL
 * @returns Buffer containing image data
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
