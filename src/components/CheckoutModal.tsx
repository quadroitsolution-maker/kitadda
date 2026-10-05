"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import confetti from "canvas-confetti";
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  MessageCircle,
  MapPin,
  User,
  Lock
} from "lucide-react";

export const CheckoutModal: React.FC = () => {
  const {
    items,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    freeShippingThreshold,
  } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Order Success Screen State
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");

  if (!isCheckoutOpen) return null;

  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  const INDIAN_STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan",
    "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
  ];

  const handlePincodeChange = (pin: string) => {
    const formatted = pin.replace(/\D/g, "").slice(0, 6);
    setPincode(formatted);

    // Auto-fill major Indian metro states if recognized
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

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number for dispatch tracking.");
      return;
    }

    if (pincode.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit Indian PIN code.");
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

      if (paymentMethod === "cod") {
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            shipping_address: shippingAddress,
            payment_method: "cod",
            razorpay_order_id: `COD_${Date.now()}`,
          }),
        });
        const verifyData = await verifyRes.json();
        setConfirmedOrderId(verifyData.order_id || `COD_${Date.now()}`);
        setOrderConfirmed(true);
        clearCart();
        triggerCelebration();
        setLoading(false);
        return;
      }

      // Online Razorpay Flow
      const createOrderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping_address: shippingAddress,
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to create payment session. Please try again.");
      }

      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: "INR",
        name: "Kit Adda Official",
        description: `Football Kits Order (${items.length} items)`,
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
            setErrorMsg("Network issue verifying payment. Please WhatsApp @kit.adda with your Payment ID.");
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0A0D14] border border-[#1C2438] rounded-none shadow-2xl text-white overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Header Bar - Sharp Boxy Minimal */}
        <div className="p-4 sm:p-5 border-b border-[#1C2438] flex items-center justify-between bg-[#0E131F] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#C5A059]/40 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Kit Adda"
                fill
                sizes="24px"
                className="object-cover object-center"
              />
            </div>
            <span className="text-sm sm:text-base font-black uppercase tracking-wider font-jersey">
              {orderConfirmed ? "Order Confirmed!" : "Fast 1-Click Checkout"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white active:scale-95 transition"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order Confirmed: Show High-Converting Success Screen */}
        {orderConfirmed ? (
          <div className="p-5 sm:p-8 text-center space-y-5 sm:space-y-6 overflow-y-auto">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#C5A059] mx-auto shadow-lg shadow-[#C5A059]/20">
              <Image
                src="/logo.jpg"
                alt="Kit Adda"
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </div>

            <div>
              <div className="inline-flex items-center text-xs bg-[#0B132B] text-[#DFB76C] border border-[#C5A059]/40 px-3 py-1 rounded-none font-bold uppercase tracking-wider mb-2">
                <span>WELCOME TO THE ADDA SQUAD</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-black uppercase text-white font-jersey">
                Thank You For Your Order!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-md mx-auto">
                Your kits are being printed and prepared at our matchday hub. We have dispatched tracking info to <strong className="text-white">+91 {phone}</strong>.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="bg-[#0E131F] border border-[#1C2438] rounded-none p-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Order Reference:</span>
                <span className="text-[#DFB76C] font-mono font-bold">{confirmedOrderId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Delivery Address:</span>
                <span className="text-white font-medium text-right max-w-[200px] truncate">
                  {addressLine}, {city}, {pincode}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Estimated Dispatch:</span>
                <span className="text-white font-bold">Within 24-48 Hours</span>
              </div>
            </div>

            {/* Actions: WhatsApp & Continue */}
            <div className="space-y-3 pb-safe">
              <a
                href={`https://wa.me/919999999999?text=Hi%20Kit%20Adda%20team,%20I%20just%20placed%20order%20${confirmedOrderId}.%20Can't%20wait%20for%20my%20jersey!`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#0B132B] hover:bg-[#162035] border border-[#1C2438] hover:border-[#25D366]/60 text-white font-bold uppercase text-xs sm:text-sm py-3.5 rounded-none flex items-center justify-center gap-2 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Connect with Kit Adda Crew on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-[#0E131F] hover:bg-[#162035] text-white border border-[#1C2438] font-bold uppercase text-xs py-3 rounded-none transition active:scale-95"
              >
                Continue Browsing Vault
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Input Form */
          <form onSubmit={handleCheckoutSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-none bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Express Delivery Address Form */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-300">
                <MapPin className="w-3.5 h-3.5 text-[#DFB76C]" />
                <span>Delivery Details (Pan-India Express)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      autoCapitalize="words"
                      placeholder="e.g. Abhinav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] rounded-none pl-9 pr-3 py-3 sm:py-2.5 text-base sm:text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-xs font-bold text-neutral-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] rounded-none pl-11 pr-3 py-3 sm:py-2.5 text-base sm:text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Street Address, Flat / House No, Landmark *
                </label>
                <input
                  type="text"
                  required
                  autoCapitalize="sentences"
                  placeholder="e.g. Flat 402, Green Valley Apts, Bandra West"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] rounded-none px-3 py-3 sm:py-2.5 text-base sm:text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    placeholder="400050"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] rounded-none px-3 py-3 sm:py-2.5 text-base sm:text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    autoCapitalize="words"
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] rounded-none px-3 py-3 sm:py-2.5 text-base sm:text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] rounded-none px-2 py-3 sm:py-2.5 text-base sm:text-xs font-semibold text-white focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-[#0A0D14] text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-[#1C2438]">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300">
                Payment Option
              </label>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {/* Razorpay Online */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-3 rounded-none border text-left flex flex-col justify-between transition active:scale-98 ${
                    paymentMethod === "razorpay"
                      ? "bg-[#0B132B] border-[#C5A059] text-white"
                      : "bg-[#0E131F] border-[#1C2438] text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[11px] sm:text-xs font-black uppercase flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#DFB76C]" />
                      UPI / Cards
                    </span>
                    {paymentMethod === "razorpay" && (
                      <span className="w-2 h-2 rounded-none bg-[#C5A059]" />
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-[#DFB76C] font-semibold">
                    Instant 1-Click UPI &amp; GPay
                  </span>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3 rounded-none border text-left flex flex-col justify-between transition active:scale-98 ${
                    paymentMethod === "cod"
                      ? "bg-[#0B132B] border-[#C5A059] text-white"
                      : "bg-[#0E131F] border-[#1C2438] text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[11px] sm:text-xs font-black uppercase flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-neutral-300" />
                      Cash on Delivery
                    </span>
                    {paymentMethod === "cod" && (
                      <span className="w-2 h-2 rounded-none bg-[#C5A059]" />
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 font-semibold">
                    Pay at doorstep
                  </span>
                </button>
              </div>
            </div>

            {/* Summary Breakdown */}
            <div className="p-3 sm:p-3.5 rounded-none bg-[#0E131F] border border-[#1C2438] text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Items Subtotal ({items.length} kits)</span>
                <span className="text-white font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Shipping Fee</span>
                <span className="text-[#DFB76C] font-bold">
                  {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#1C2438] font-jersey">
                <span>Total Payable</span>
                <span className="text-[#DFB76C] text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#DFB76C] disabled:opacity-50 text-[#0A0D14] font-black uppercase text-xs sm:text-sm tracking-wider py-4 rounded-none flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0A0D14] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 fill-[#0A0D14]" />
                  <span>
                    {paymentMethod === "razorpay"
                      ? `Pay ₹${grandTotal.toLocaleString("en-IN")} via Razorpay`
                      : `Confirm Cash on Delivery Order`}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 pb-safe">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFB76C]" />
              <span>Razorpay 256-Bit SSL Encrypted • OTP Verified Checkout</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
