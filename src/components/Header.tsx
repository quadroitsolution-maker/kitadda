"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Search 
} from "lucide-react";

export const Header: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { name: "Player Version", id: "player-version", href: "/#latest-drops" },
    { name: "Fan Version", id: "fan-version", href: "/#latest-drops" },
    { name: "Grip Socks", id: "accessories", href: "/#latest-drops" },
    { name: "World Cup", id: "world-cup", href: "/#latest-drops" },
  ];

  const handleCategoryNav = (catId: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kitadda:selectCategory", { detail: catId }));
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Banner - Clean, Static Minimal Announcement */}
      <div className="bg-[#0B132B] text-[#DFB76C] text-[11px] font-semibold py-1.5 px-4 text-center tracking-wider border-b border-[#1C2438]">
        FREE ALL-INDIA EXPRESS SHIPPING ON ₹1499+ • COD AVAILABLE
      </div>

      {/* Main Header - Clean & Minimal */}
      <header className="sticky top-0 z-40 bg-[#0A0D14]/95 backdrop-blur-md border-b border-[#1C2438]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 text-neutral-300 hover:text-white focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo - Official Emblem + Name */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 overflow-hidden rounded-full border border-[#C5A059]/40 group-hover:border-[#C5A059] transition-colors">
                  <Image
                    src="/logo.jpg"
                    alt="Kit Adda"
                    fill
                    sizes="40px"
                    className="object-cover object-center"
                    priority
                  />
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white font-jersey group-hover:text-[#DFB76C] transition-colors">
                  KIT<span className="text-[#C5A059]">ADDA</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links - Clean & Minimal */}
            <nav className="hidden lg:flex items-center space-x-8">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => handleCategoryNav(cat.id)}
                  className="text-xs font-bold text-neutral-300 hover:text-[#DFB76C] uppercase tracking-wider transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Right Action Icons: Minimal Search & Minimal Cart Trigger */}
            <div className="flex items-center space-x-5">
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="p-1 text-neutral-300 hover:text-[#DFB76C] transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Minimal Cart Link */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-200 hover:text-[#DFB76C] transition-colors tracking-wider uppercase"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart</span>
                {mounted && cartCount > 0 && (
                  <span className="text-[#DFB76C] font-mono">
                    ({cartCount})
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#0A0D14] border-r border-[#1C2438] h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#1C2438]">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C5A059]/40 shrink-0">
                    <Image
                      src="/logo.jpg"
                      alt="Kit Adda"
                      fill
                      sizes="32px"
                      className="object-cover object-center"
                    />
                  </div>
                  <span className="text-xl font-black uppercase text-white font-jersey">
                    KIT<span className="text-[#C5A059]">ADDA</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => handleCategoryNav(cat.id)}
                    className="p-3 text-neutral-200 hover:text-[#DFB76C] hover:bg-[#0E131F] font-bold uppercase tracking-wider text-xs transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#1C2438] text-[11px] text-neutral-400 text-center">
              100% Master Grade Quality
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0E131F] border border-[#1C2438] rounded-none shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2438]">
              <span className="text-[#DFB76C] font-bold text-xs uppercase tracking-wider">
                Search Kits
              </span>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <input
                type="text"
                autoFocus
                placeholder="Search jerseys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0D14] border border-[#1C2438] rounded-none px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A059] text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
