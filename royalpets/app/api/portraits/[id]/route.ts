import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/portraits/[id]
 * Fetch a single portrait by ID
 */
export async function GET(
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

    const supabase = createServiceRoleClient();

    const { data: portrait, error } = await supabase
      .from("portraits")
      .select("*")
      .eq("id", id)
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
    console.error("Failed to fetch portrait:", error);
    return NextResponse.json(
      { error: "Failed to fetch portrait" },
      { status: 500 }
    );
  }
}
