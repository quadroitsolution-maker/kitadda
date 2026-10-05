"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Home, Sparkles, Search, ShoppingBag } from "lucide-react";
import { WhatsAppIcon } from "@/components/Icons";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen, isCartOpen, isCheckoutOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide when cart or checkout modal is open
  if (!mounted || isCartOpen || isCheckoutOpen) return null;

  const handleDropsClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("latest-drops");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSearchClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kitadda:openSearch"));
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D14]/95 backdrop-blur-xl border-t border-[#1C2438] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_25px_rgba(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
            pathname === "/" ? "text-[#DFB76C]" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-jersey">
            Home
          </span>
        </Link>

        {/* 2. Drops / Vault */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
            pathname === "/products" ? "text-[#DFB76C]" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-jersey">
            Vault
          </span>
        </Link>

        {/* 3. Search */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center h-full text-neutral-400 hover:text-[#DFB76C] active:scale-95 transition-colors"
          aria-label="Search jerseys"
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-jersey">
            Search
          </span>
        </button>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center h-full text-neutral-400 hover:text-[#DFB76C] active:scale-95 transition-colors"
          aria-label="Open Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#C5A059] text-[#0A0D14] font-black text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-mono">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider font-jersey">
            Cart
          </span>
        </button>

        {/* 5. WhatsApp Support */}
        <a
          href="https://wa.me/919999999999?text=Hi%20Kit%20Adda%2C%20I%20have%20a%20query%20regarding%20a%20jersey"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center h-full text-neutral-400 hover:text-[#25D366] active:scale-95 transition-colors"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon className="w-4 h-4 mb-0.5 text-[#25D366]" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-jersey text-neutral-400">
            Chat
          </span>
        </a>
      </div>
    </nav>
  );
};
