"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "@/types";

export interface AppliedCouponInfo {
  code: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  description?: string;
  discountAmount: number;
  freeShipping: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "cart_item_id">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  shippingRemaining: number;
  appliedCoupon: AppliedCouponInfo | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  effectiveShippingFee: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "kitadda_cart_v1";
const COUPON_STORAGE_KEY = "kitadda_applied_coupon_v1";
const FREE_SHIPPING_LIMIT = 999;
const STANDARD_SHIPPING_FEE = 99;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load initial cart", e);
      }
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(COUPON_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load applied coupon", e);
      }
    }
    return null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save coupon", e);
    }
  }, [appliedCoupon]);

  const addToCart = (newItem: Omit<CartItem, "cart_item_id">) => {
    const cart_item_id = `${newItem.product.id}-${newItem.size}-${newItem.version}-${newItem.custom_name}-${newItem.custom_number}-${newItem.patches ? "patched" : "standard"}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.cart_item_id === cart_item_id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, { ...newItem, cart_item_id }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.cart_item_id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  const shippingRemaining = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);

  // Calculate live coupon discount based on current cart subtotal
  let couponDiscount = 0;
  let hasFreeShippingCoupon = false;

  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discount_type === "percentage") {
      couponDiscount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
    } else if (appliedCoupon.discount_type === "fixed") {
      couponDiscount = Math.min(appliedCoupon.discount_value, subtotal);
    } else if (appliedCoupon.discount_type === "free_shipping") {
      hasFreeShippingCoupon = true;
    }
  }

  const effectiveShippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT || hasFreeShippingCoupon
      ? 0
      : STANDARD_SHIPPING_FEE;

  const grandTotal = Math.max(0, subtotal - couponDiscount + effectiveShippingFee);

  const applyCoupon = async (rawCode: string): Promise<{ success: boolean; message: string }> => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: "Please enter a coupon code" };
    }

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || "Invalid coupon code" };
      }

      const couponInfo: AppliedCouponInfo = {
        code: data.coupon.code,
        discount_type: data.coupon.discount_type,
        discount_value: data.coupon.discount_value,
        description: data.coupon.description,
        discountAmount: data.discountAmount || 0,
        freeShipping: data.coupon.discount_type === "free_shipping",
      };

      setAppliedCoupon(couponInfo);
      return { success: true, message: data.message || `Coupon ${code} applied!` };
    } catch (err) {
      console.error("Apply coupon error:", err);
      return { success: false, message: "Network error validating coupon" };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        cartCount,
        subtotal,
        freeShippingThreshold: FREE_SHIPPING_LIMIT,
        shippingRemaining,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        effectiveShippingFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
