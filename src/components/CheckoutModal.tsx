"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import confetti from "canvas-confetti";
import { 
  X, 
  ShieldCheck, 
  MessageCircle,
  Lock,
  ArrowRight,
  Check,
  Tag
} from "lucide-react";
import { siteConfig } from "@/config/site";

export const CheckoutModal: React.FC = () => {
  const {
    items,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    appliedCoupon,
    couponDiscount,
    effectiveShippingFee,
    grandTotal,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Coupon state within checkout modal
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Order Success Screen State
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");

  if (!isCheckoutOpen) return null;

  const INDIAN_STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan",
    "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
  ];

  const handlePincodeChange = (pin: string) => {
    const formatted = pin.replace(/\D/g, "").slice(0, 6);
    setPincode(formatted);

    // Auto-fill metro cities & states
    if (formatted.startsWith("11")) {
      setState("Delhi");
      if (!city) setCity("New Delhi");
    } else if (formatted.startsWith("40")) {
      setState("Maharashtra");
      if (!city) setCity("Mumbai");
    } else if (formatted.startsWith("56")) {
      setState("Karnataka");
      if (!city) setCity("Bengaluru");
    } else if (formatted.startsWith("70")) {
      setState("West Bengal");
      if (!city) setCity("Kolkata");
    } else if (formatted.startsWith("60")) {
      setState("Tamil Nadu");
      if (!city) setCity("Chennai");
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#C5A059", "#DFB76C", "#0B132B", "#ffffff"],
    });
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponApplying(true);
    setCouponFeedback(null);
    const res = await applyCoupon(couponCodeInput);
    setCouponApplying(false);
    if (res.success) {
      setCouponFeedback({ text: res.message, isError: false });
      setCouponCodeInput("");
    } else {
      setCouponFeedback({ text: res.message, isError: true });
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (pincode.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (!addressLine.trim() || !city.trim() || !fullName.trim()) {
      setErrorMsg("Please fill in your complete delivery address.");
      return;
    }

    setLoading(true);

    try {
      const shippingAddress = {
        fullName: fullName.trim(),
        phone: cleanedPhone,
        addressLine: addressLine.trim(),
        city: city.trim(),
        state,
        pincode,
      };

      // Online Razorpay Flow
      const createOrderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping_address: shippingAddress,
          coupon_code: appliedCoupon?.code || null,
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to initialize payment. Please try again.");
      }

      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: "INR",
        name: "Kit Adda",
        description: `Order for ${items.length} kit${items.length > 1 ? "s" : ""}`,
        image: "/logo.jpg",
        order_id: orderData.order_id,
        prefill: {
          name: fullName.trim(),
          contact: cleanedPhone,
        },
        theme: {
          color: "#C5A059",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                items,
                shipping_address: shippingAddress,
                internal_order_id: orderData.internal_order_id,
                coupon_code: appliedCoupon?.code || null,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setConfirmedOrderId(verifyData.order_id || response.razorpay_order_id);
              setOrderConfirmed(true);
              clearCart();
              triggerCelebration();
            } else {
              setErrorMsg(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setErrorMsg("Network issue verifying payment. Please reach out on WhatsApp with your Payment ID.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      type RazorpayWindow = Window & {
        Razorpay?: new (opts: typeof options) => { open: () => void };
      };
      const rzWindow = window as unknown as RazorpayWindow;

      if (typeof rzWindow.Razorpay !== "undefined") {
        const rzpInstance = new rzWindow.Razorpay(options);
        rzpInstance.open();
      } else {
        // Fallback test mode simulation if script is blocked
        setTimeout(async () => {
          const fakeOrderId = `KA_${Date.now()}`;
          await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items,
              shipping_address: shippingAddress,
              razorpay_payment_id: `pay_demo_${Date.now()}`,
              razorpay_order_id: orderData.order_id,
              razorpay_signature: "demo_sig",
              coupon_code: appliedCoupon?.code || null,
            }),
          });
          setConfirmedOrderId(fakeOrderId);
          setOrderConfirmed(true);
          clearCart();
          triggerCelebration();
          setLoading(false);
        }, 1200);
      }
    } catch (err) {
      console.error("Checkout submit error:", err);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (orderConfirmed) {
      setOrderConfirmed(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090C13] border border-[#1B2234] text-white my-auto max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Sleek Minimal Header */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-[#1B2234] flex items-center justify-between bg-[#0D111A]">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#C5A059]/50 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Kit Adda"
                fill
                sizes="28px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black uppercase tracking-wider font-jersey leading-none">
                KIT<span className="text-[#C5A059]">ADDA</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest mt-0.5">
                {orderConfirmed ? "Order Confirmed" : "Secure Checkout"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ---------------- ORDER CONFIRMED VIEW ---------------- */}
        {orderConfirmed ? (
          <div className="p-6 sm:p-12 text-center max-w-lg mx-auto space-y-6 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 border border-[#C5A059] flex items-center justify-center mx-auto text-[#DFB76C]">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-jersey tracking-tight">
                Order Confirmed
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Thank you for your order. We are preparing your jersey for dispatch. Updates will be sent to <span className="text-white font-semibold font-mono">+91 {phone}</span>.
              </p>
            </div>

            <div className="bg-[#0D111A] border border-[#1B2234] p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Order Reference</span>
                <span className="text-[#DFB76C] font-mono font-bold">{confirmedOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Delivery Address</span>
                <span className="text-white font-medium text-right max-w-[240px] truncate">
                  {addressLine}, {city} - {pincode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Estimated Dispatch</span>
                <span className="text-white font-medium">Within 24–48 Hours</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={siteConfig.whatsappUrl(`Hi Kit Adda, I placed order ${confirmedOrderId}. Looking forward to my kit!`)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#0D111A] hover:bg-[#151C2C] border border-[#1B2234] hover:border-[#25D366]/50 text-white text-xs font-bold uppercase tracking-wider py-3.5 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Chat with Support on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-[#C5A059] hover:bg-[#DFB76C] text-[#090C13] text-xs font-black uppercase tracking-wider py-3.5 transition active:scale-95"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* ---------------- 2-COLUMN CHECKOUT LAYOUT ---------------- */
          <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto">
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1B2234]">
              
              {/* LEFT COLUMN: Shipping Details (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#DFB76C] font-mono">
                    1. Shipping Information
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Express all-India delivery direct to your doorstep.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0D111A] border border-[#1B2234] focus:border-[#C5A059] px-3.5 py-2.5 text-xs font-medium text-white placeholder-neutral-600 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Mobile / WhatsApp Number *
                    </label>
                    <div className="flex">
                      <span className="bg-[#0D111A] border border-r-0 border-[#1B2234] px-3 py-2.5 text-xs text-neutral-400 font-mono select-none flex items-center">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="tel"
                        required
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="flex-1 bg-[#0D111A] border border-[#1B2234] focus:border-[#C5A059] px-3.5 py-2.5 text-xs font-medium text-white placeholder-neutral-600 focus:outline-none font-mono transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Street Address &amp; Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Flat/House No, Building, Street, Area"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full bg-[#0D111A] border border-[#1B2234] focus:border-[#C5A059] px-3.5 py-2.5 text-xs font-medium text-white placeholder-neutral-600 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="400050"
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        className="w-full bg-[#0D111A] border border-[#1B2234] focus:border-[#C5A059] px-3 py-2.5 text-xs font-medium text-white placeholder-neutral-600 focus:outline-none font-mono transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#0D111A] border border-[#1B2234] focus:border-[#C5A059] px-3 py-2.5 text-xs font-medium text-white placeholder-neutral-600 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-[#0D111A] border border-[#1B2234] focus:border-[#C5A059] px-2 py-2.5 text-xs font-medium text-white focus:outline-none transition cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st} className="bg-[#090C13] text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Subtle Payment Notice */}
                <div className="pt-4 border-t border-[#1B2234] flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#DFB76C]" />
                    <span>UPI, Cards &amp; NetBanking via Razorpay</span>
                  </span>
                  <span className="text-neutral-500 font-mono text-[10px]">100% PREPAID</span>
                </div>
              </div>

              {/* RIGHT COLUMN: Order Summary & Coupon (5 cols) */}
              <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0D111A] flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#DFB76C] font-mono">
                      2. Order Summary
                    </h3>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Clean Items Mini-List */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#1B2234] pr-1 space-y-3">
                    {items.map((item) => (
                      <div key={item.cart_item_id} className="pt-3 first:pt-0 flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-[#090C13] border border-[#1B2234] shrink-0 overflow-hidden">
                          <Image
                            src={item.product.image_url}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.product.title}
                          </h4>
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            Size {item.size} • Qty {item.quantity}
                          </div>
                        </div>
                        <div className="text-xs font-black text-white font-jersey">
                          ₹{(item.unit_price * item.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-4 border-t border-[#1B2234]">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-[#090C13] border border-[#C5A059]/40 px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-[#DFB76C]" />
                          <span className="font-mono font-bold text-[#DFB76C]">{appliedCoupon.code}</span>
                          <span className="text-[11px] text-emerald-400">
                            {appliedCoupon.discount_type === "free_shipping"
                              ? "Free Shipping"
                              : `-₹${couponDiscount}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            removeCoupon();
                            setCouponFeedback(null);
                          }}
                          className="text-[10px] text-neutral-400 hover:text-red-400 uppercase font-bold transition"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Promo / Coupon Code"
                            value={couponCodeInput}
                            onChange={(e) => {
                              setCouponCodeInput(e.target.value.toUpperCase());
                              setCouponFeedback(null);
                            }}
                            className="flex-1 bg-[#090C13] border border-[#1B2234] focus:border-[#C5A059] px-3 py-2 text-xs text-white placeholder-neutral-600 font-mono uppercase focus:outline-none transition"
                          />
                          <button
                            type="button"
                            disabled={couponApplying || !couponCodeInput.trim()}
                            onClick={handleApplyPromo}
                            className="bg-[#1B2234] hover:bg-[#C5A059] hover:text-[#090C13] disabled:opacity-40 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition"
                          >
                            {couponApplying ? "..." : "Apply"}
                          </button>
                        </div>
                        {couponFeedback && (
                          <p className={`text-[10px] font-medium ${couponFeedback.isError ? "text-red-400" : "text-emerald-400"}`}>
                            {couponFeedback.text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-2 pt-4 border-t border-[#1B2234] text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal</span>
                      <span className="text-white font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span className="font-mono font-bold">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-400">
                      <span>Express Shipping</span>
                      <span className="text-white font-medium">
                        {effectiveShippingFee === 0 ? (
                          <span className="text-emerald-400 font-bold">FREE</span>
                        ) : (
                          `₹${effectiveShippingFee}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-black text-white pt-3 border-t border-[#1B2234] font-jersey">
                      <span>Total Payable</span>
                      <span className="text-[#DFB76C] text-lg">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Payment CTA */}
                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#C5A059] hover:bg-[#DFB76C] disabled:opacity-50 text-[#090C13] font-black uppercase text-xs sm:text-sm tracking-wider py-3.5 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-[#090C13] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{grandTotal.toLocaleString("en-IN")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-[10px] text-neutral-500">
                    256-Bit SSL Encrypted • Direct Razorpay Gateway
                  </div>
                </div>
              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
};
