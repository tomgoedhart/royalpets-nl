import { NextRequest, NextResponse } from "next/server";
import {
  uploadFile,
  isR2Configured,
  generateFileKey,
  TEMP_FILE_EXPIRY_SECONDS,
} from "@/lib/r2";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Accepted MIME types
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

interface UploadResponse {
  success: boolean;
  key?: string;
  url?: string;
  publicUrl?: string;
  expiresAt?: string;
  message?: string;
  errors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if R2 is configured
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Storage service not configured",
        } as UploadResponse,
        { status: 503 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string | null;
    const contentType = formData.get("contentType") as string | null;
    const folder = (formData.get("folder") as string) || "uploads";

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
        } as UploadResponse,
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        } as UploadResponse,
        { status: 413 }
      );
    }

    // Validate file type
    const actualContentType = contentType || file.type;
    if (!ACCEPTED_TYPES.includes(actualContentType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type. Accepted: ${ACCEPTED_TYPES.join(", ")}`,
        } as UploadResponse,
        { status: 415 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique key
    const key = generateFileKey(filename || file.name, folder);

    // Upload to R2
    const result = await uploadFile(buffer, filename || file.name, actualContentType, {
      folder,
      metadata: {
        originalName: filename || file.name,
        uploadedFrom: "api",
      },
      isTemporary: true,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      publicUrl: result.publicUrl,
      expiresAt: result.expiresAt?.toISOString(),
    } as UploadResponse);
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      } as UploadResponse,
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
