"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Zap,
  Sparkles
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
  } = useCart();

  if (!isCartOpen) return null;

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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0e0e12] border-l border-neutral-800 text-white flex flex-col justify-between shadow-2xl">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider font-jersey">
                Your Bag ({cartCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-[#141419] border-b border-neutral-800">
            {shippingRemaining > 0 ? (
              <p className="text-xs text-neutral-300 font-medium">
                Add <strong className="text-emerald-400 font-bold">₹{shippingRemaining}</strong> more to unlock <span className="text-white font-bold">FREE Express Delivery</span> across India ⚡
              </p>
            ) : (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>You unlocked FREE Express All-India Shipping!</span>
              </p>
            )}
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${shippingProgressPct}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-neutral-800/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                  <ShoppingBag className="w-8 h-8" />
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
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase px-6 py-3 rounded-xl transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.cart_item_id} className="pt-4 first:pt-0 flex gap-3.5">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
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
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
                          {item.product.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cart_item_id)}
                          className="text-neutral-500 hover:text-red-400 transition p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Attributes */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-neutral-400">
                        <span className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded text-neutral-300 font-bold">
                          Size {item.size}
                        </span>
                        <span>•</span>
                        <span className="text-neutral-300">{item.version}</span>
                      </div>

                      {/* Customization Details */}
                      {(item.custom_name || item.custom_number || item.patches) && (
                        <div className="mt-1.5 p-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-[10px] space-y-0.5">
                          {(item.custom_name || item.custom_number) && (
                            <div className="text-emerald-400 font-bold font-jersey">
                              PRINT: {item.custom_name || "--"} #{item.custom_number || "--"}
                            </div>
                          )}
                          {item.patches && (
                            <div className="text-neutral-300 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              <span>Sleeve Patches (+₹{item.patch_fee})</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stepper & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/40">
                      <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          className="w-6 h-6 text-neutral-400 hover:text-white font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          className="w-6 h-6 text-neutral-400 hover:text-white font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-white font-jersey">
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
            <div className="p-4 sm:p-5 border-t border-neutral-800 bg-[#0a0a0d] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-400 font-bold">
                    {subtotal >= freeShippingThreshold ? "FREE" : "₹99"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-800 font-jersey">
                  <span>Estimated Total</span>
                  <span className="text-emerald-400 text-base">
                    ₹{(subtotal + (subtotal >= freeShippingThreshold ? 0 : 99)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* 1-Click Breeze Style Checkout Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs sm:text-sm tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition transform active:scale-95 shadow-xl shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Fast 1-Click Checkout (Breeze)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Encrypted Payment • UPI / Cards / COD</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
