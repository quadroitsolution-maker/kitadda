"use client";

import React from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { 
  X, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Zap
} from "lucide-react";

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    cartCount,
    freeShippingThreshold,
    shippingRemaining,
    setIsCheckoutOpen,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    effectiveShippingFee,
    grandTotal,
  } = useCart();

  const [couponInput, setCouponInput] = React.useState("");
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [couponError, setCouponError] = React.useState("");
  const [couponSuccess, setCouponSuccess] = React.useState("");

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    const res = await applyCoupon(couponInput);
    setCouponLoading(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput("");
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess("");
    setCouponError("");
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const shippingProgressPct = Math.min(
    100,
    Math.round(((freeShippingThreshold - shippingRemaining) / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0A0D14] border-l border-[#1C2438] text-white flex flex-col justify-between shadow-2xl">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#1C2438] flex items-center justify-between bg-[#0E131F]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#C5A059]/40 shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Kit Adda"
                  fill
                  sizes="28px"
                  className="object-cover object-center"
                />
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider font-jersey">
                Your Bag ({cartCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-none text-neutral-400 hover:text-white active:scale-95 transition"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-4 sm:px-5 py-3 bg-[#0E131F] border-b border-[#1C2438]">
            {shippingRemaining > 0 ? (
              <p className="text-xs text-neutral-300 font-medium">
                Add <strong className="text-[#DFB76C] font-bold">₹{shippingRemaining}</strong> more for <span className="text-white font-bold">FREE Express Delivery</span> across India
              </p>
            ) : (
              <p className="text-xs text-[#DFB76C] font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#DFB76C]" />
                <span>You unlocked FREE Express All-India Shipping!</span>
              </p>
            )}
            <div className="w-full bg-[#1C2438] h-1.5 rounded-none mt-2 overflow-hidden">
              <div
                className="bg-[#C5A059] h-full transition-all duration-300 rounded-none"
                style={{ width: `${shippingProgressPct}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-[#1C2438]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#C5A059]/40 shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="Kit Adda"
                    fill
                    sizes="64px"
                    className="object-cover object-center"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-jersey">
                    Your Adda Bag is Empty
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                    Explore our latest 2024/25 drops and retro grails to gear up for matchday.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] text-xs font-black uppercase px-6 py-3.5 rounded-none transition active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.cart_item_id} className="pt-4 first:pt-0 flex gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 rounded-none overflow-hidden bg-[#0E131F] shrink-0 border border-[#1C2438]">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.title}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
                          {item.product.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cart_item_id)}
                          className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-red-400 transition active:scale-95 shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Attributes */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-neutral-400 font-mono">
                        <span className="bg-[#0B132B] border border-[#1C2438] px-1.5 py-0.5 rounded-none text-[#DFB76C] font-bold">
                          Size {item.size}
                        </span>
                        <span>•</span>
                        <span className="text-neutral-300">{item.version}</span>
                      </div>
                    </div>

                    {/* Stepper & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C2438]">
                      <div className="flex items-center bg-[#0B132B] border border-[#1C2438] rounded-none">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white font-bold text-xs active:scale-95"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white font-bold text-xs active:scale-95"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-white font-jersey">
                          ₹{(item.unit_price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#1C2438] bg-[#0E131F] space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {/* Coupon / Promo Code Section */}
              <div className="border border-[#1C2438] bg-[#0A0D14] p-2.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#DFB76C]/10 text-[#DFB76C] border border-[#C5A059]/40 text-[11px] font-black uppercase px-2 py-0.5 font-mono">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-bold">
                        {appliedCoupon.discount_type === "free_shipping"
                          ? "FREE Express Shipping applied"
                          : `-₹${couponDiscount} discount applied`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] uppercase font-bold text-neutral-400 hover:text-red-400 transition underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Promo / Coupon Code"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                          setCouponSuccess("");
                        }}
                        className="flex-1 bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 font-mono uppercase focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        className="bg-[#C5A059] hover:bg-[#DFB76C] disabled:opacity-50 text-[#0A0D14] px-3.5 py-1.5 text-xs font-black uppercase transition shrink-0"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[10px] text-red-400 font-medium">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-[10px] text-emerald-400 font-medium">{couponSuccess}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span className="font-bold">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Shipping</span>
                  <span className="text-[#DFB76C] font-bold">
                    {effectiveShippingFee === 0 ? "FREE" : `₹${effectiveShippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#1C2438] font-jersey">
                  <span>Estimated Total</span>
                  <span className="text-[#DFB76C] text-base">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] font-black uppercase text-xs sm:text-sm tracking-wider py-4 rounded-none flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <Zap className="w-4 h-4 fill-[#0A0D14]" />
                <span>Fast 1-Click Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DFB76C]" />
                <span>100% Encrypted • 100% Prepaid (UPI / Cards / NetBanking)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
