import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SelectImageRequest {
  selectedImageIndex: number;
}

/**
 * POST /api/portraits/[id]/select
 * Update the selected image index for a portrait
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Portrait ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate request body
    const { selectedImageIndex } = body as SelectImageRequest;

    if (typeof selectedImageIndex !== "number") {
      return NextResponse.json(
        { error: "selectedImageIndex must be a number" },
        { status: 400 }
      );
    }

    if (selectedImageIndex < 0 || selectedImageIndex > 3) {
      return NextResponse.json(
        { error: "selectedImageIndex must be between 0 and 3" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Update the portrait
    const { data: portrait, error } = await supabase
      .from("portraits")
      .update({
        selected_image_index: selectedImageIndex,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Portrait not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ portrait });
  } catch (error) {
    console.error("Failed to update portrait selection:", error);
    return NextResponse.json(
      { error: "Failed to update selection" },
      { status: 500 }
    );
  }
}

/**
 * Handle CORS preflight
 */
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
