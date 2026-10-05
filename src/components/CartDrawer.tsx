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

                      {/* Customization Details */}
                      {(item.custom_name || item.custom_number || item.patches) && (
                        <div className="mt-1.5 p-1.5 rounded-none bg-[#0E131F] border border-[#1C2438] text-[10px] space-y-0.5">
                          {(item.custom_name || item.custom_number) && (
                            <div className="text-[#DFB76C] font-bold font-jersey">
                              PRINT: {item.custom_name || "--"} #{item.custom_number || "--"}
                            </div>
                          )}
                          {item.patches && (
                            <div className="text-neutral-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-none bg-[#C5A059]" />
                              <span>Sleeve Patches (+₹{item.patch_fee})</span>
                            </div>
                          )}
                        </div>
                      )}
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
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Shipping</span>
                  <span className="text-[#DFB76C] font-bold">
                    {subtotal >= freeShippingThreshold ? "FREE" : "₹99"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#1C2438] font-jersey">
                  <span>Estimated Total</span>
                  <span className="text-[#DFB76C] text-base">
                    ₹{(subtotal + (subtotal >= freeShippingThreshold ? 0 : 99)).toLocaleString("en-IN")}
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
                <span>100% Encrypted • UPI / Cards / COD</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
