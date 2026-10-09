import { NextRequest, NextResponse } from "next/server";
import { getCoupons, createCoupon } from "@/lib/db";

export async function GET() {
  try {
    const coupons = await getCoupons(false);
    return NextResponse.json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Admin GET /api/admin/coupons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const created = await createCoupon({
      code: body.code,
      discount_type: body.discount_type || "percentage",
      discount_value: Number(body.discount_value || 0),
      min_order_amount: body.min_order_amount ? Number(body.min_order_amount) : 0,
      max_discount_amount: body.max_discount_amount ? Number(body.max_discount_amount) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      description: body.description || "",
      expires_at: body.expires_at || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        coupon: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin POST /api/admin/coupons error:", error);
    const message = error instanceof Error ? error.message : "Failed to create coupon";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
