import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCouponByCode, calculateCouponDiscount } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shipping_address, coupon_code } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shipping_address || !shipping_address.phone) {
      return NextResponse.json(
        { error: "Shipping details and phone number are required" },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (acc: number, item: { unit_price?: number; quantity?: number; product?: { price?: number } }) => {
        const price = Number(item.unit_price ?? item.product?.price ?? 0);
        const qty = Number(item.quantity ?? 1);
        return acc + price * qty;
      },
      0
    );

    // Standard free shipping threshold: Free express delivery for all orders >= 999 automatically (no coupon needed)
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
    const amountInPaise = Math.round(totalAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay API credentials are configured, create real order with Razorpay
    if (keyId && keySecret) {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_ka_${Date.now()}`,
          notes: {
            brand: "Kit Adda",
            phone: shipping_address.phone,
            name: shipping_address.fullName,
          },
        }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        console.error("Razorpay order creation error:", rzpData);
        const detailedError =
          rzpData?.error?.description ||
          rzpData?.error?.reason ||
          rzpData?.message ||
          "Failed to initialize payment gateway";
        return NextResponse.json(
          { error: detailedError, details: rzpData },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        order_id: rzpData.id,
        amount: rzpData.amount,
        currency: rzpData.currency,
        key_id: keyId,
      });
    }

    // In local development or demo mode without live API keys, generate mock order
    const mockOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;
    return NextResponse.json({
      success: true,
      order_id: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      key_id: "rzp_test_kitadda_demo",
      is_demo: true,
    });
  } catch (error) {
    console.error("Checkout order route error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
