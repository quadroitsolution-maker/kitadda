// =========================================================================
// Supabase Edge Function: create-razorpay-order
// Runtime: Deno (TypeScript)
// Environment Variables Required:
// - RAZORPAY_KEY_ID
// - RAZORPAY_KEY_SECRET
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// =========================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItemPayload {
  product_id: string;
  size: string;
  version: string;
  custom_name?: string;
  custom_number?: string;
  patches?: boolean;
  unit_price: number;
  quantity: number;
}

interface OrderRequestPayload {
  items: CartItemPayload[];
  shipping_address: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  user_id?: string | null;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, shipping_address, user_id }: OrderRequestPayload = await req.json();

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty. Please select products." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!shipping_address || !shipping_address.phone || !shipping_address.pincode) {
      return new Response(
        JSON.stringify({ error: "Invalid shipping address or phone number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Calculate order total server-side
    const totalAmount = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_placeholder";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "secret_placeholder";

    // 2. Call Razorpay Orders API
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_ka_${Date.now()}`,
        notes: {
          brand: "Kit Adda",
          customer_phone: shipping_address.phone,
          customer_name: shipping_address.fullName,
        },
      }),
    });

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay order error:", razorpayData);
      return new Response(
        JSON.stringify({ error: "Failed to create payment order with gateway", details: razorpayData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Save order record in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const { data: orderRecord, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user_id || null,
        total_amount: totalAmount,
        payment_status: "pending",
        payment_method: "razorpay",
        razorpay_order_id: razorpayData.id,
        shipping_address: shipping_address,
        status: "processing",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Supabase order insert error:", orderError);
    }

    // 4. Save order items
    if (orderRecord) {
      const orderItemsToInsert = items.map((item) => ({
        order_id: orderRecord.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        size: item.size,
        custom_name: item.custom_name || null,
        custom_number: item.custom_number || null,
        patches: !!item.patches,
        customizations: {
          version: item.version,
        },
      }));

      await supabase.from("order_items").insert(orderItemsToInsert);
    }

    // 5. Return razorpay order details to client
    return new Response(
      JSON.stringify({
        order_id: razorpayData.id,
        currency: razorpayData.currency,
        amount: razorpayData.amount,
        internal_order_id: orderRecord ? orderRecord.id : null,
        key_id: razorpayKeyId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
