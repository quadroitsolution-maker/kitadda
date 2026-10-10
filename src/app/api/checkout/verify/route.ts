import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase";
import { createOrder, getCouponByCode, calculateCouponDiscount, incrementCouponUsage } from "@/lib/db";
import { CartItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shipping_address,
      payment_method,
      coupon_code,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify signature if secret is present
    if (keySecret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce(
      (acc: number, item: { unit_price?: number; quantity?: number; product?: { price?: number } }) => {
        const price = Number(item.unit_price ?? item.product?.price ?? 0);
        const qty = Number(item.quantity ?? 1);
        return acc + price * qty;
      },
      0
    );

    // Standard free shipping threshold: Free delivery for orders >= 999 without any coupon code
    let shippingFee = subtotal >= 999 ? 0 : 99;
    let couponDiscount = 0;

    if (coupon_code) {
      const coupon = await getCouponByCode(coupon_code);
      if (coupon) {
        const discResult = calculateCouponDiscount(coupon, subtotal, shippingFee);
        if (discResult.isValid) {
          couponDiscount = discResult.discount;
          shippingFee = discResult.finalShipping;
        }
      }
    }

    const totalAmount = Math.max(1, subtotal - couponDiscount + shippingFee);

    // Increment coupon usage count asynchronously if valid coupon was applied
    if (coupon_code) {
      incrementCouponUsage(coupon_code).catch((err) =>
        console.warn("Failed to increment coupon usage:", err)
      );
    }

    // Record order (handles deduplication, Supabase persistence, and inventory decrement)
    const orderRecord = await createOrder({
      total_amount: totalAmount,
      payment_status: "paid",
      payment_method: payment_method || "razorpay",
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      razorpay_signature: razorpay_signature || null,
      shipping_address,
      status: "processing",
      items,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order_id: orderRecord.id || razorpay_order_id || `ORD_${Date.now()}`,
    });
  } catch (error) {
    console.error("Verification error:", error);
    const message = error instanceof Error ? error.message : "Failed to verify order";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
