import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type PortraitStatus = Database["public"]["Enums"]["portrait_status"];

interface StatusResponse {
  success: boolean;
  portraitId?: string;
  status?: PortraitStatus;
  progress?: number;
  images?: string[];
  error?: string;
  message?: string;
}

/**
 * Calculate simulated progress based on status and time
 */
function calculateProgress(status: PortraitStatus, createdAt: string): number {
  if (status === "completed") return 100;
  if (status === "failed") return 0;
  
  const created = new Date(createdAt).getTime();
  const elapsed = Date.now() - created;
  
  // Estimate progress based on typical generation time (30 seconds)
  const estimatedTotal = 30000; // 30 seconds
  const progress = Math.min((elapsed / estimatedTotal) * 100, 95);
  
  return Math.round(progress);
}

/**
 * GET handler for checking generation status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get portrait ID from query params
    const { searchParams } = new URL(request.url);
    const portraitId = searchParams.get("id");

    if (!portraitId) {
      return NextResponse.json(
        {
          success: false,
          message: "Portrait ID is required",
        } as StatusResponse,
        { status: 400 }
      );
    }

    // Fetch portrait from database
    const supabase = createServiceRoleClient();
    const { data: portrait, error } = await supabase
      .from("portraits")
      .select("id, status, generated_images, generation_error, created_at")
      .eq("id", portraitId)
      .single();

    if (error) {
      console.error("Failed to fetch portrait status:", error);
      // Check if it's a "not found" error
      if (error.message?.includes("not found") || error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            message: "Portrait not found",
          } as StatusResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch portrait status",
        } as StatusResponse,
        { status: 500 }
      );
    }

    if (!portrait) {
      return NextResponse.json(
        {
          success: false,
          message: "Portrait not found",
        } as StatusResponse,
        { status: 404 }
      );
    }

    // Extract image URLs if completed
    const images = portrait.status === "completed" && portrait.generated_images
      ? (portrait.generated_images as Array<{ url: string }>).map(img => img.url)
      : undefined;

    // Calculate progress (default to pending if status is null)
    const safeStatus: PortraitStatus = portrait.status || "pending";
    const safeCreatedAt = portrait.created_at || new Date().toISOString();
    const progress = calculateProgress(safeStatus, safeCreatedAt);

    return NextResponse.json({
      success: true,
      portraitId: portrait.id,
      status: portrait.status || "pending",
      progress,
      images,
      error: portrait.generation_error || undefined,
    } as StatusResponse);

  } catch (error) {
    console.error("Status check error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      } as StatusResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for canceling a generation (if still pending)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const portraitId = searchParams.get("id");

    if (!portraitId) {
      return NextResponse.json(
        {
          success: false,
          message: "Portrait ID is required",
        } as StatusResponse,
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Only allow canceling if still pending or generating
    const { data: portrait, error: fetchError } = await supabase
      .from("portraits")
      .select("status")
      .eq("id", portraitId)
      .single();

    if (fetchError || !portrait) {
      return NextResponse.json(
        {
          success: false,
          message: "Portrait not found",
        } as StatusResponse,
        { status: 404 }
      );
    }

    if (portrait.status !== "pending" && portrait.status !== "generating") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot cancel generation that is already completed or failed",
        } as StatusResponse,
        { status: 400 }
      );
    }

    // Update status to failed
    const { error: updateError } = await supabase
      .from("portraits")
      .update({
        status: "failed",
        generation_error: "Cancelled by user",
      })
      .eq("id", portraitId);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to cancel generation",
        } as StatusResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      portraitId,
      status: "failed",
      message: "Generation cancelled",
    } as StatusResponse);

  } catch (error) {
    console.error("Cancel generation error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      } as StatusResponse,
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
      "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
