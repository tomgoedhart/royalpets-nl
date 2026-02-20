import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { generateCostumePrompt, isValidCostumeId } from "@/lib/prompts";
import { generateImageVariations, downloadImage, isOpenAIConfigured } from "@/lib/openai";
import { uploadFile, generateFileKey, TEMP_FILE_EXPIRY_SECONDS } from "@/lib/r2";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "@/lib/rate-limit";
import type { Database } from "@/types/supabase";

// Rate limit configuration
const RATE_LIMIT_MAX = 5; // 5 generations per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface GenerateRequest {
  imageUrl: string;
  costumeId: string;
  petType?: "dog" | "cat" | "other";
  petName?: string;
  sessionId?: string;
}

interface GenerateResponse {
  success: boolean;
  portraitId?: string;
  images?: string[];
  message?: string;
  errors?: string[];
}

/**
 * Validate the request body
 */
function validateRequest(body: unknown): { valid: boolean; errors: string[]; data?: GenerateRequest } {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    errors.push("Request body must be an object");
    return { valid: false, errors };
  }

  const { imageUrl, costumeId, petType, petName, sessionId } = body as GenerateRequest;

  // Validate imageUrl
  if (!imageUrl || typeof imageUrl !== "string") {
    errors.push("imageUrl is required and must be a string");
  } else {
    try {
      new URL(imageUrl);
    } catch {
      errors.push("imageUrl must be a valid URL");
    }
  }

  // Validate costumeId
  if (!costumeId || typeof costumeId !== "string") {
    errors.push("costumeId is required and must be a string");
  } else if (!isValidCostumeId(costumeId)) {
    errors.push(`Invalid costumeId: ${costumeId}`);
  }

  // Validate petType if provided
  if (petType && !["dog", "cat", "other"].includes(petType)) {
    errors.push("petType must be one of: dog, cat, other");
  }

  // Validate petName if provided
  if (petName && (typeof petName !== "string" || petName.length > 100)) {
    errors.push("petName must be a string with maximum 100 characters");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      imageUrl,
      costumeId,
      petType: petType || "dog",
      petName,
      sessionId,
    },
  };
}

/**
 * Download image from URL
 */
async function downloadImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url, { 
    signal: AbortSignal.timeout(30000) // 30 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.startsWith("image/")) {
    throw new Error("Downloaded file is not an image");
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Store portrait record in database
 */
async function createPortraitRecord(
  data: GenerateRequest,
  originalImagePath: string,
  generatedImages: { url: string; path: string }[]
): Promise<string> {
  const supabase = createServiceRoleClient();
  
  const expiresAt = new Date(Date.now() + TEMP_FILE_EXPIRY_SECONDS * 1000);
  
  const { data: portrait, error } = await supabase
    .from("portraits")
    .insert({
      original_image_url: data.imageUrl,
      original_image_path: originalImagePath,
      costume_id: data.costumeId,
      pet_type: data.petType || "dog",
      pet_name: data.petName || null,
      session_id: data.sessionId || null,
      status: "completed",
      generated_images: generatedImages.map((img, index) => ({
        index,
        url: img.url,
        path: img.path,
      })),
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create portrait record: ${error.message}`);
  }

  return portrait.id;
}

/**
 * Update portrait with error status
 */
async function updatePortraitError(portraitId: string, errorMessage: string): Promise<void> {
  const supabase = createServiceRoleClient();
  
  await supabase
    .from("portraits")
    .update({
      status: "failed",
      generation_error: errorMessage,
    })
    .eq("id", portraitId);
}

/**
 * Create initial portrait record with pending status
 */
async function createPendingPortrait(data: GenerateRequest): Promise<string> {
  const supabase = createServiceRoleClient();
  
  // Extract path from URL for original image
  const originalImagePath = data.imageUrl.split("/").slice(-2).join("/"); // Get last 2 path segments
  
  const expiresAt = new Date(Date.now() + TEMP_FILE_EXPIRY_SECONDS * 1000);
  
  const { data: portrait, error } = await supabase
    .from("portraits")
    .insert({
      original_image_url: data.imageUrl,
      original_image_path: originalImagePath || "uploads/unknown",
      costume_id: data.costumeId,
      pet_type: data.petType || "dog",
      pet_name: data.petName || null,
      session_id: data.sessionId || null,
      status: "generating",
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create portrait record: ${error.message}`);
  }

  return portrait.id;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: "AI generation service not configured",
        } as GenerateResponse,
        { status: 503 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimitResult.retryAfter! / 60)} minutes.`,
        } as GenerateResponse,
        { 
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            "Retry-After": String(rateLimitResult.retryAfter),
          },
        }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        } as GenerateResponse,
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        } as GenerateResponse,
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Create pending portrait record
    const portraitId = await createPendingPortrait(data);

    try {
      // Download the original image from R2
      const originalImageBuffer = await downloadImageBuffer(data.imageUrl);
      
      // Generate costume prompt
      const prompt = generateCostumePrompt(data.costumeId, data.petType, data.petName);
      
      // Generate 4 image variations using OpenAI
      const generatedImages = await generateImageVariations(prompt, 4);
      
      // Download and upload each generated image to R2
      const uploadedImages: { url: string; path: string }[] = [];
      
      for (let i = 0; i < generatedImages.length; i++) {
        const generatedImage = generatedImages[i];
        
        // Download the generated image
        const imageBuffer = await downloadImage(generatedImage.url);
        
        // Upload to R2
        const filename = `generated-${i + 1}.png`;
        const uploadResult = await uploadFile(
          imageBuffer,
          filename,
          "image/png",
          {
            folder: "portraits",
            metadata: {
              portraitId,
              costumeId: data.costumeId,
              variation: String(i + 1),
              generatedAt: new Date().toISOString(),
            },
            isTemporary: true,
          }
        );
        
        uploadedImages.push({
          url: uploadResult.publicUrl,
          path: uploadResult.key,
        });
      }

      // Update portrait record with generated images
      const supabase = createServiceRoleClient();
      await supabase
        .from("portraits")
        .update({
          status: "completed",
          generated_images: uploadedImages.map((img, index) => ({
            index,
            url: img.url,
            path: img.path,
          })),
        })
        .eq("id", portraitId);

      const processingTime = Date.now() - startTime;
      console.log(`Portrait generation completed in ${processingTime}ms: ${portraitId}`);

      return NextResponse.json(
        {
          success: true,
          portraitId,
          images: uploadedImages.map((img) => img.url),
        } as GenerateResponse,
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    } catch (error) {
      // Update portrait with error status
      const errorMessage = error instanceof Error ? error.message : "Unknown error during generation";
      await updatePortraitError(portraitId, errorMessage);
      
      throw error;
    }
  } catch (error) {
    console.error("Generation error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      } as GenerateResponse,
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
