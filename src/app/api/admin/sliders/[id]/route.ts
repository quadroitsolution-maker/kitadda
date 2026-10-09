import { NextRequest, NextResponse } from "next/server";
import { updateSlider, deleteSlider } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateSlider(id, {
      badge: body.badge,
      headline: body.headline,
      description: body.description,
      cta_link: body.cta_link,
      image_url: body.image_url,
      is_active: body.is_active,
      order_index: body.order_index !== undefined ? Number(body.order_index) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Slider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slider updated successfully",
      slide: updated,
    });
  } catch (error) {
    console.error("Admin PUT /api/admin/sliders/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update slider";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteSlider(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Slider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    console.error("Admin DELETE /api/admin/sliders/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete slider";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
