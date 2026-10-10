"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/types";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Search, 
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/Icons";
import { siteConfig } from "@/config/site";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    setMounted(true);
    // Fetch live products for search if available
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // Listen for openSearch event from MobileBottomNav
  useEffect(() => {
    const handleOpenSearch = () => {
      setShowSearchModal(true);
    };
    window.addEventListener("kitadda:openSearch", handleOpenSearch);
    return () => window.removeEventListener("kitadda:openSearch", handleOpenSearch);
  }, []);

  const categories = [
    { name: "All Drops", id: "all", href: "/products", badge: "Vault" },
    { name: "Player Version", id: "player-version", href: "/products?category=player-version", badge: "Pro Spec" },
    { name: "Fan Version", id: "fan-version", href: "/products?category=fan-version", badge: "Matchday" },
    { name: "Grip Socks", id: "accessories", href: "/products?category=accessories", badge: "Anti-Slip" },
    { name: "World Cup", id: "world-cup", href: "/products?category=world-cup", badge: "Grails" },
  ];

  const handleCategoryNav = (catId: string, href: string, e?: React.MouseEvent) => {
    if (e && pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("kitadda:selectCategory", { detail: catId }));
    }
    setMobileMenuOpen(false);
  };

  // Filtered products for live search
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery, allProducts]);

  const trendingTags = ["Real Madrid", "Arsenal", "Player Version", "Grip Socks", "Bellingham"];

  return (
    <>
      {/* Top Banner - Clean, Minimal Announcement with Mobile Sizing */}
      <div className="bg-[#0B132B] text-[#DFB76C] text-[10px] sm:text-[11px] font-semibold py-1.5 px-3 sm:px-4 text-center tracking-wider border-b border-[#1C2438] flex items-center justify-center gap-1.5">
        <span>FREE PAN-INDIA SHIPPING ON ₹999+</span>
        <span className="opacity-50">•</span>
        <span>PREPAID ORDERS ONLY (NO COD)</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#0A0D14]/95 backdrop-blur-md border-b border-[#1C2438]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Mobile Hamburger Button - Minimum 44x44px touch area */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="w-11 h-11 flex items-center justify-center -ml-1 text-neutral-300 hover:text-white active:scale-95 transition-transform"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo - Official Emblem + Name */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 overflow-hidden rounded-full border border-[#C5A059]/40 group-hover:border-[#C5A059] transition-colors">
                  <Image
                    src="/logo.jpg"
                    alt="Kit Adda"
                    fill
                    sizes="40px"
                    className="object-cover object-center"
                    priority
                  />
                </div>
                <span className="text-lg sm:text-2xl font-black tracking-tight uppercase text-white font-jersey group-hover:text-[#DFB76C] transition-colors">
                  KIT<span className="text-[#C5A059]">ADDA</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={(e) => handleCategoryNav(cat.id, cat.href, e)}
                  className="text-xs font-bold text-neutral-300 hover:text-[#DFB76C] uppercase tracking-wider transition-colors py-2"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Search button with full 44px tap zone */}
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="w-11 h-11 flex items-center justify-center text-neutral-300 hover:text-[#DFB76C] active:scale-95 transition-transform"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="h-11 px-2 flex items-center gap-1.5 text-xs font-bold text-neutral-200 hover:text-[#DFB76C] active:scale-95 transition-transform tracking-wider uppercase"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="hidden sm:inline">Cart</span>
                {mounted && cartCount > 0 && (
                  <span className="bg-[#C5A059] text-[#0A0D14] font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {cartCount}
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
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[85%] max-w-xs bg-[#0A0D14] border-r border-[#1C2438] h-full p-5 flex flex-col justify-between overflow-y-auto z-10">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1C2438]">
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
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free shipping highlight */}
              <div className="mt-4 p-3 bg-[#0E131F] border border-[#1C2438] text-[11px] text-[#DFB76C] font-semibold">
                ⚽ FREE All-India Shipping on orders ₹999+
              </div>

              {/* Categories */}
              <div className="mt-5 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-3 mb-1 font-jersey">
                  Categories
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={(e) => handleCategoryNav(cat.id, cat.href, e)}
                    className="flex items-center justify-between p-3.5 text-neutral-200 hover:text-[#DFB76C] active:bg-[#0E131F] font-bold uppercase tracking-wider text-xs border-b border-[#1C2438]/50"
                  >
                    <span>{cat.name}</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                      <span className="bg-[#0B132B] text-[#DFB76C] px-1.5 py-0.5 border border-[#1C2438]">
                        {cat.badge}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                    </span>
                  </Link>
                ))}
              </div>

              {/* Direct Quick Actions */}
              <div className="mt-6 pt-4 border-t border-[#1C2438] space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-3 mb-1 font-jersey">
                  Quick Support
                </div>
                <a
                  href={siteConfig.whatsappUrl("Hi Kit Adda, I have a query regarding a jersey")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#0B132B] border border-[#1C2438] text-white hover:text-[#25D366] text-xs font-bold uppercase tracking-wider transition"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Chat Support</span>
                </a>
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#0E131F] border border-[#1C2438] text-white hover:text-[#DFB76C] text-xs font-bold uppercase tracking-wider transition"
                >
                  <InstagramIcon className="w-4 h-4 text-[#DFB76C]" />
                  <span>Follow @kit.adda</span>
                </a>
              </div>
            </div>

            <div className="pt-5 border-t border-[#1C2438] text-[10px] text-neutral-400 text-center font-mono pb-safe">
              100% MASTER GRADE • WEAR THE GAME
            </div>
          </div>
        </div>
      )}

      {/* Live Mobile-Optimized Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-16 px-3 sm:px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0E131F] border border-[#1C2438] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1C2438] bg-[#0A0D14]">
              <span className="text-[#DFB76C] font-bold text-xs uppercase tracking-wider font-jersey">
                Search Kit Adda Drops
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery("");
                }}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-[#1C2438] bg-[#0A0D14]">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search club, player, country or version..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0E131F] border border-[#1C2438] rounded-none pl-10 pr-9 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A059] text-xs sm:text-sm font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Trending Quick Suggestions */}
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider shrink-0 mr-1">
                  Trending:
                </span>
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="text-[10px] px-2.5 py-1 bg-[#0B132B] hover:bg-[#162035] text-neutral-300 hover:text-[#DFB76C] border border-[#1C2438] shrink-0 font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Body */}
            <div className="overflow-y-auto p-4 flex-1 space-y-2.5">
              {searchQuery.trim() === "" ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  Type to instantly search all Player &amp; Fan Version jerseys
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setShowSearchModal(false);
                      setSearchQuery("");
                      router.push(`/products/${product.id}`);
                    }}
                    className="cursor-pointer flex items-center gap-3.5 p-2.5 bg-[#0A0D14] border border-[#1C2438] hover:border-[#C5A059]/60 active:scale-[0.99] transition-all"
                  >
                    <div className="relative w-12 h-14 bg-[#0E131F] shrink-0 border border-[#1C2438] overflow-hidden">
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {product.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                        <span className="text-[#DFB76C] font-mono font-bold">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        <span>•</span>
                        <span className="uppercase">{product.version_type}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No drops found for &quot;{searchQuery}&quot;. Try searching &quot;Player Version&quot; or &quot;Madrid&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
