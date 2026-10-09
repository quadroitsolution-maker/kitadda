import { NextRequest, NextResponse } from "next/server";
import { getSliders, createSlider, reorderSliders } from "@/lib/db";

export async function GET() {
  try {
    const slides = await getSliders(false); // get all including inactive
    return NextResponse.json({
      success: true,
      count: slides.length,
      slides,
    });
  } catch (error) {
    console.error("Admin GET /api/admin/sliders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch slides" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if reordering action
    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      const reordered = await reorderSliders(body.orderedIds);
      return NextResponse.json({
        success: true,
        message: "Slides reordered successfully",
        slides: reordered,
      });
    }

    if (!body.headline || !body.image_url) {
      return NextResponse.json(
        { success: false, error: "Headline and Image URL are required" },
        { status: 400 }
      );
    }

    const created = await createSlider({
      badge: body.badge || "NEW DROP",
      headline: body.headline,
      description: body.description || "",
      cta_link: body.cta_link || "#latest-drops",
      image_url: body.image_url,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      order_index: body.order_index,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Slider created successfully",
        slide: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin POST /api/admin/sliders error:", error);
    const message = error instanceof Error ? error.message : "Failed to create slider";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
