import { NextResponse } from "next/server";
import { getSliders } from "@/lib/db";

export async function GET() {
  try {
    const slides = await getSliders(true); // active slides only
    return NextResponse.json({
      success: true,
      count: slides.length,
      slides,
    });
  } catch (error) {
    console.error("GET /api/sliders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sliders" },
      { status: 500 }
    );
  }
}
