import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase";
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

    // Insert order into Supabase
    try {
      const supabase = getServiceSupabase();
      const subtotal = items.reduce(
        (acc: number, item: { unit_price: number; quantity: number }) => acc + item.unit_price * item.quantity,
        0
      );
      const totalAmount = subtotal + (subtotal >= 1499 ? 0 : 99);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          total_amount: totalAmount,
          payment_status: payment_method === "cod" ? "pending" : "paid",
          payment_method: payment_method || "razorpay",
          razorpay_order_id: razorpay_order_id || null,
          razorpay_payment_id: razorpay_payment_id || null,
          razorpay_signature: razorpay_signature || null,
          shipping_address,
          status: "processing",
        })
        .select()
        .single();

      if (!orderError && orderData && items.length > 0) {
        const orderItems = items.map((item: CartItem) => ({
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          size: item.size,
          custom_name: item.custom_name || null,
          custom_number: item.custom_number || null,
          patches: item.patches || false,
          customizations: {
            version: item.version,
            title: item.product.title,
          },
        }));

        await supabase.from("order_items").insert(orderItems);
      }
    } catch (dbErr) {
      console.warn("Supabase record write skipped or failed (demo mode active)", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order_id: razorpay_order_id || `COD_${Date.now()}`,
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
