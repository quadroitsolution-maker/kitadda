import { NextRequest, NextResponse } from "next/server";
import { getCouponByCode, calculateCouponDiscount } from "@/lib/db";
import { siteConfig } from "@/config/site";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a valid coupon code" },
        { status: 400 }
      );
    }

    const coupon = await getCouponByCode(code);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: `Coupon "${code.toUpperCase()}" is invalid or expired` },
        { status: 404 }
      );
    }

    const orderSubtotal = Number(subtotal) || 0;
    const standardShippingFee = orderSubtotal >= siteConfig.freeShippingThreshold ? 0 : siteConfig.defaultShippingFee;

    const result = calculateCouponDiscount(coupon, orderSubtotal, standardShippingFee);

    if (!result.isValid) {
      return NextResponse.json(
        { success: false, error: result.error || "Coupon cannot be applied" },
        { status: 400 }
      );
    }

    const finalTotal = Math.max(0, orderSubtotal - result.discount + result.finalShipping);

    return NextResponse.json({
      success: true,
      message: result.message,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        description: coupon.description,
      },
      discountAmount: result.discount,
      shippingFee: result.finalShipping,
      finalTotal,
    });
  } catch (error) {
    console.error("POST /api/coupons/apply error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
