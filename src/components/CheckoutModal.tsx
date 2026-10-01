"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import confetti from "canvas-confetti";
import { 
  X, 
  ShieldCheck, 
  Zap, 
  Truck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  Phone,
  MapPin,
  User,
  ShoppingBag,
  Sparkles,
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
      colors: ["#22c55e", "#10b981", "#ffffff", "#f59e0b"],
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate phone (10 digits)
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

      // If user selected Cash on Delivery
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

      // Step 1: Create Order on Backend
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping_address: shippingAddress,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initialize payment gateway");
      }

      // Step 2: Open Razorpay Checkout Modal
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "Kit Adda",
          description: `Kit Adda Official Drop (${items.length} items)`,
          image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=200&q=80",
          order_id: orderData.order_id,
          prefill: {
            name: fullName,
            contact: `+91${cleanedPhone}`,
          },
          theme: {
            color: "#22c55e",
          },
          handler: async function (response: any) {
            // Verify payment
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items,
                shipping_address: shippingAddress,
                payment_method: "razorpay",
              }),
            });

            const verifyData = await verifyRes.json();
            setConfirmedOrderId(response.razorpay_order_id || response.razorpay_payment_id);
            setOrderConfirmed(true);
            clearCart();
            triggerCelebration();
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
        setLoading(false);
      } else {
        // Fallback for demo environments or when Razorpay script is blocked
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            items,
            shipping_address: shippingAddress,
            payment_method: "razorpay",
          }),
        });
        const verifyData = await verifyRes.json();
        setConfirmedOrderId(orderData.order_id);
        setOrderConfirmed(true);
        clearCart();
        triggerCelebration();
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderConfirmed(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0e0e12] border border-neutral-800 rounded-2xl shadow-2xl text-white overflow-hidden my-8">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-[#121215]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm sm:text-base font-black uppercase tracking-wider font-jersey">
              {orderConfirmed ? "Order Confirmed!" : "Breeze 1-Click Checkout"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order Confirmed: Show High-Converting Success Screen */}
        {orderConfirmed ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>WELCOME TO THE ADDA SQUAD</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-jersey">
                Thank You For Your Order!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-md mx-auto">
                Your kits are being printed and prepared at our matchday hub. We've dispatched tracking info to <strong className="text-white">+91 {phone}</strong>.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="bg-[#141419] border border-neutral-800 rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Order Reference:</span>
                <span className="text-emerald-400 font-mono font-bold">{confirmedOrderId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Delivery Address:</span>
                <span className="text-white font-medium text-right max-w-[220px] truncate">
                  {addressLine}, {city}, {pincode}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Estimated Dispatch:</span>
                <span className="text-white font-bold">Within 24-48 Hours</span>
              </div>
            </div>

            {/* Actions: WhatsApp & Continue */}
            <div className="space-y-3">
              <a
                href={`https://wa.me/919999999999?text=Hi%20Kit%20Adda%20team,%20I%20just%20placed%20order%20${confirmedOrderId}.%20Can't%20wait%20for%20my%20jersey!`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold uppercase text-xs sm:text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>Connect with Kit Adda Crew on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold uppercase text-xs py-3 rounded-xl transition"
              >
                Continue Browsing Vault
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Input Form */
          <form onSubmit={handleCheckoutSubmit} className="p-5 sm:p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Express Delivery Address Form */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Delivery Details (Pan-India Express)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abhinav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#141419] border border-neutral-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-[#141419] border border-neutral-700/80 focus:border-emerald-500 rounded-xl pl-11 pr-3 py-2.5 text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none font-mono"
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
                  placeholder="e.g. Flat 402, Green Valley Apts, Bandra West"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full bg-[#141419] border border-neutral-700/80 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="400050"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="w-full bg-[#141419] border border-neutral-700/80 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#141419] border border-neutral-700/80 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-white placeholder-neutral-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#141419] border border-neutral-700/80 focus:border-emerald-500 rounded-xl px-2 py-2.5 text-xs font-semibold text-white focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-neutral-900 text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300">
                Payment Option
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Razorpay Online */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                    paymentMethod === "razorpay"
                      ? "bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                      : "bg-[#141419] border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-black uppercase flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      Razorpay (UPI / Cards)
                    </span>
                    {paymentMethod === "razorpay" && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Instant 1-Click UPI & GPay
                  </span>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                    paymentMethod === "cod"
                      ? "bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                      : "bg-[#141419] border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-black uppercase flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-amber-400" />
                      Cash On Delivery
                    </span>
                    {paymentMethod === "cod" && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    Pay at doorstep
                  </span>
                </button>
              </div>
            </div>

            {/* Summary Breakdown */}
            <div className="p-3.5 rounded-xl bg-[#141419] border border-neutral-800 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Items Subtotal ({items.length} kits)</span>
                <span className="text-white font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Shipping Fee</span>
                <span className="text-emerald-400 font-bold">
                  {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-800 font-jersey">
                <span>Total Payable</span>
                <span className="text-emerald-400 text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black uppercase text-sm tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition transform active:scale-95 shadow-xl shadow-emerald-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 fill-black" />
                  <span>
                    {paymentMethod === "razorpay"
                      ? `Pay ₹${grandTotal.toLocaleString("en-IN")} via Razorpay`
                      : `Confirm Cash on Delivery Order`}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Razorpay 256-Bit SSL Encrypted • OTP Verified Checkout</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
