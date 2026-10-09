import { NextRequest, NextResponse } from "next/server";
import { updateCoupon, deleteCoupon } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateCoupon(id, {
      code: body.code,
      discount_type: body.discount_type,
      discount_value: body.discount_value !== undefined ? Number(body.discount_value) : undefined,
      min_order_amount: body.min_order_amount !== undefined ? Number(body.min_order_amount) : undefined,
      max_discount_amount: body.max_discount_amount !== undefined ? Number(body.max_discount_amount) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
      description: body.description,
      expires_at: body.expires_at,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updated,
    });
  } catch (error) {
    console.error("Admin PUT /api/admin/coupons/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update coupon";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteCoupon(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Admin DELETE /api/admin/coupons/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete coupon";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
