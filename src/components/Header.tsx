"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Search, 
  ChevronDown, 
  ArrowRight
} from "lucide-react";

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const Header: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const categories = [
    { name: "Player Version", href: "/#latest-drops", badge: "MATCH" },
    { name: "Fan Version", href: "/#latest-drops", badge: "24/25" },
    { name: "World Cup", href: "/#latest-drops" },
    { name: "Grip Socks", href: "/#latest-drops" },
  ];

  return (
    <>
      {/* Top Ticker Banner - Solid Navy Minimal */}
      <div className="bg-[#0B132B] text-[#E8D09B] text-xs font-semibold py-2 px-4 overflow-hidden border-b border-[#1C2438]">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 justify-around">
          <span className="flex items-center gap-1.5 tracking-wider">
            AUTHENTIC MASTER GRADE FOOTBALL JERSEYS • INDIA
          </span>
          <span className="text-[#3A4A72]">•</span>
          <span className="flex items-center gap-1.5 tracking-wider">
            FREE EXPRESS SHIPPING ON ORDERS ₹1499+
          </span>
          <span className="text-[#3A4A72]">•</span>
          <span className="flex items-center gap-1.5 tracking-wider">
            CASH ON DELIVERY & INSTANT UPI AVAILABLE
          </span>
          <span className="text-[#3A4A72]">•</span>
          <span className="flex items-center gap-1.5 text-[#DFB76C] tracking-wider">
            INSTAGRAM OFFICIAL: @KIT.ADDA
          </span>
          <span className="text-[#3A4A72]">•</span>
          <span className="flex items-center gap-1.5 tracking-wider">
            OFFICIAL PLAYER NAME & NUMBER PRINTING
          </span>
        </div>
      </div>

      {/* Main Header - Deep Charcoal with Navy/Champagne Accent */}
      <header className="sticky top-0 z-40 bg-[#0A0D14]/95 backdrop-blur-md border-b border-[#1C2438]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-neutral-300 hover:text-[#DFB76C] hover:bg-[#0E131F] rounded-none focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo & Tagline Anchor */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex flex-col group">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-white font-jersey group-hover:text-[#DFB76C] transition-colors">
                    KIT<span className="text-[#C5A059]">ADDA</span>
                  </span>
                  <span className="hidden sm:inline-block bg-[#0B132B] text-[#DFB76C] border border-[#C5A059]/40 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                    @kit.adda
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-medium -mt-1">
                  Football Kit Culture • India
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                href="/#latest-drops"
                className="px-3.5 py-2 text-xs font-bold text-neutral-200 hover:text-[#DFB76C] hover:bg-[#0E131F] rounded-none transition-all uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>Latest Drops</span>
                <span className="bg-[#0B132B] text-[#DFB76C] border border-[#C5A059]/40 text-[9px] px-1.5 py-0.5 rounded-none font-bold">
                  NEW
                </span>
              </Link>

              {/* Mega Menu Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  type="button"
                  className="px-3.5 py-2 text-xs font-bold text-neutral-200 hover:text-[#DFB76C] hover:bg-[#0E131F] rounded-none transition-all uppercase tracking-wider flex items-center gap-1"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {megaMenuOpen && (
                  <div className="absolute top-full left-0 w-80 bg-[#0E131F] border border-[#1C2438] rounded-none shadow-2xl p-4 py-3 grid gap-2 z-50">
                    <Link
                      href="/#latest-drops"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-none hover:bg-[#162035] transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-[#DFB76C]">Player Version</div>
                        <div className="text-xs text-neutral-400">Current Season Match-Spec Jerseys</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#DFB76C] transition" />
                    </Link>
                    <Link
                      href="/#latest-drops"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-none hover:bg-[#162035] transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-[#DFB76C]">Fan Version</div>
                        <div className="text-xs text-neutral-400">Current Season Stadium Fit Jerseys</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#DFB76C] transition" />
                    </Link>
                    <Link
                      href="/#latest-drops"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-none hover:bg-[#162035] transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-[#DFB76C]">World Cup</div>
                        <div className="text-xs text-neutral-400">National Team Tournament Editions</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#DFB76C] transition" />
                    </Link>
                    <Link
                      href="/#latest-drops"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-none hover:bg-[#162035] transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-[#DFB76C]">Grip Socks</div>
                        <div className="text-xs text-neutral-400">Anti-Slip Football Grip Socks</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#DFB76C] transition" />
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/#latest-drops"
                className="px-3.5 py-2 text-xs font-bold text-neutral-200 hover:text-[#DFB76C] hover:bg-[#0E131F] rounded-none transition-all uppercase tracking-wider"
              >
                Player Version
              </Link>
              <Link
                href="/#latest-drops"
                className="px-3.5 py-2 text-xs font-bold text-neutral-200 hover:text-[#DFB76C] hover:bg-[#0E131F] rounded-none transition-all uppercase tracking-wider"
              >
                Fan Version
              </Link>
              <Link
                href="/#latest-drops"
                className="px-3.5 py-2 text-xs font-bold text-neutral-200 hover:text-[#DFB76C] hover:bg-[#0E131F] rounded-none transition-all uppercase tracking-wider"
              >
                World Cup
              </Link>
              <Link
                href="/#latest-drops"
                className="px-3.5 py-2 text-xs font-bold text-[#DFB76C] hover:text-[#E8D09B] hover:bg-[#0B132B] rounded-none transition-all uppercase tracking-wider"
              >
                Grip Socks
              </Link>
            </nav>

            {/* Right Action Icons: Search & Cart Button */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-neutral-300 hover:text-[#DFB76C] hover:bg-[#0E131F] rounded-none transition"
                aria-label="Search football kits"
              >
                <Search className="w-5 h-5" />
              </button>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-300 hover:text-[#DFB76C] bg-[#0E131F] border border-[#1C2438] px-3 py-1.5 rounded-none transition"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span className="font-semibold">@kit.adda</span>
              </a>

              {/* Cart Drawer Trigger - Champagne Gold */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] font-black px-3.5 sm:px-4 py-2 rounded-none flex items-center gap-2 transition-all transform active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black">Cart</span>
                {cartCount > 0 && (
                  <span className="bg-[#0A0D14] text-[#DFB76C] text-xs font-black px-1.5 py-0.5 rounded-none min-w-[20px] text-center border border-[#C5A059]/50">
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#0A0D14] border-r border-[#1C2438] h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#1C2438]">
                <div className="flex flex-col">
                  <span className="text-2xl font-black uppercase text-white font-jersey">
                    KIT<span className="text-[#C5A059]">ADDA</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                    @kit.adda • Football Hub
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 flex flex-col space-y-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-none text-neutral-200 hover:text-[#DFB76C] hover:bg-[#0E131F] font-bold uppercase tracking-wide text-xs transition"
                  >
                    <span>{cat.name}</span>
                    {cat.badge && (
                      <span className="bg-[#0B132B] text-[#DFB76C] border border-[#C5A059]/40 text-[10px] px-2 py-0.5 rounded-none font-black">
                        {cat.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#1C2438] space-y-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0B132B] border border-[#1C2438] rounded-none text-xs font-bold text-[#DFB76C] hover:bg-[#162035]"
              >
                <InstagramIcon className="w-4 h-4 text-[#DFB76C]" />
                <span>Follow on Instagram @kit.adda</span>
              </a>
              <div className="text-[11px] text-center text-neutral-400">
                100% Master Grade Quality Guaranteed
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-[#0E131F] border border-[#1C2438] rounded-none shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C2438]">
              <div className="flex items-center gap-2 text-[#DFB76C] font-bold text-xs uppercase tracking-wider">
                <Search className="w-4 h-4" />
                <span>Search Kit Adda Vault</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4">
              <input
                type="text"
                autoFocus
                placeholder="Search jerseys (e.g. Madrid, Arsenal, Messi, Ronaldo, Retro)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0D14] border border-[#1C2438] rounded-none px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A059] text-sm"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-neutral-500 self-center mr-1">Trending:</span>
              {["Real Madrid", "Arsenal Away", "Argentina 3-Star", "07/08 Moscow Retro", "Bellingham"].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                  }}
                  className="text-xs bg-[#0B132B] border border-[#1C2438] hover:border-[#C5A059]/60 text-neutral-300 px-3 py-1 rounded-none transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
