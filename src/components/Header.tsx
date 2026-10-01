"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Search, 
  ShieldCheck, 
  Flame, 
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
    { name: "Latest Drops", href: "#latest-drops", badge: "NEW" },
    { name: "Retro Kits", href: "#retro-vault", badge: "HOT" },
    { name: "International", href: "#category-international" },
    { name: "Accessories", href: "#category-accessories" },
    { name: "Clearance Sale", href: "#clearance", highlight: true },
  ];

  return (
    <>
      {/* Top Hype Ticker Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-neutral-900 to-emerald-600 text-white text-xs font-semibold py-1.5 px-4 overflow-hidden border-b border-emerald-500/20">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 justify-around">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            WELCOME TO THE ADDA: 100% MASTER GRADE KITS
          </span>
          <span className="text-neutral-400">•</span>
          <span className="flex items-center gap-1.5">
            ⚡ FREE EXPRESS ALL-INDIA SHIPPING ON ₹1499+
          </span>
          <span className="text-neutral-400">•</span>
          <span className="flex items-center gap-1.5">
            📦 CASH ON DELIVERY AVAILABLE
          </span>
          <span className="text-neutral-400">•</span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            📸 INSTAGRAM OFFICIAL: @KIT.ADDA
          </span>
          <span className="text-neutral-400">•</span>
          <span className="flex items-center gap-1.5">
            🔥 PLAYER NAME & NUMBER PRINTING AVAILABLE
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo & Tagline Anchor */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex flex-col group">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-white font-jersey group-hover:text-emerald-400 transition-colors">
                    KIT<span className="text-emerald-500">ADDA</span>
                  </span>
                  <span className="hidden sm:inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
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
                className="px-3.5 py-2 text-sm font-bold text-neutral-200 hover:text-emerald-400 hover:bg-neutral-900/60 rounded-md transition-all uppercase tracking-wide flex items-center gap-1.5"
              >
                <span>Latest Drops</span>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold">
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
                  className="px-3.5 py-2 text-sm font-bold text-neutral-200 hover:text-emerald-400 hover:bg-neutral-900/60 rounded-md transition-all uppercase tracking-wide flex items-center gap-1"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {megaMenuOpen && (
                  <div className="absolute top-full left-0 w-80 bg-[#121215] border border-neutral-800 rounded-xl shadow-2xl p-4 py-3 grid gap-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      href="/#category-club"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-neutral-800/80 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-400">Club Kits</div>
                        <div className="text-xs text-neutral-400">Real Madrid, Arsenal, Barca, Man City</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition" />
                    </Link>
                    <Link
                      href="/#category-retro"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-neutral-800/80 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-400">Retro Vault</div>
                        <div className="text-xs text-neutral-400">07/08 Moscow, 06/07 Milan, 98 Ronaldo</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition" />
                    </Link>
                    <Link
                      href="/#category-international"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-neutral-800/80 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-400">International</div>
                        <div className="text-xs text-neutral-400">Argentina 3-Stars, Portugal, France, Brazil</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition" />
                    </Link>
                    <Link
                      href="/#category-jackets"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-neutral-800/80 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-400">Anthem Jackets</div>
                        <div className="text-xs text-neutral-400">Windbreakers & Hoodies</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition" />
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/#retro-vault"
                className="px-3.5 py-2 text-sm font-bold text-neutral-200 hover:text-emerald-400 hover:bg-neutral-900/60 rounded-md transition-all uppercase tracking-wide"
              >
                Retro Kits
              </Link>
              <Link
                href="/#international"
                className="px-3.5 py-2 text-sm font-bold text-neutral-200 hover:text-emerald-400 hover:bg-neutral-900/60 rounded-md transition-all uppercase tracking-wide"
              >
                International
              </Link>
              <Link
                href="/#clearance"
                className="px-3.5 py-2 text-sm font-extrabold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-md transition-all uppercase tracking-wide"
              >
                Clearance Sale
              </Link>
            </nav>

            {/* Right Action Icons: Search & Cart Button */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                aria-label="Search football kits"
              >
                <Search className="w-5 h-5" />
              </button>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-pink-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg transition"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span className="font-semibold">@kit.adda</span>
              </a>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-3.5 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black">Cart</span>
                {cartCount > 0 && (
                  <span className="bg-black text-emerald-400 text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center border border-emerald-400/30">
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
          <div className="relative w-4/5 max-w-sm bg-[#0d0d10] border-r border-neutral-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
                <div className="flex flex-col">
                  <span className="text-2xl font-black uppercase text-white font-jersey">
                    KIT<span className="text-emerald-500">ADDA</span>
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

              <div className="mt-6 flex flex-col space-y-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-lg text-neutral-200 hover:text-white hover:bg-neutral-800/60 font-bold uppercase tracking-wide text-sm transition"
                  >
                    <span>{cat.name}</span>
                    {cat.badge && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-black">
                        {cat.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800 space-y-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-300 hover:text-white"
              >
                <InstagramIcon className="w-4 h-4 text-pink-400" />
                <span>Follow us on Instagram @kit.adda</span>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase">
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
                className="w-full bg-[#09090b] border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
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
                  className="text-xs bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 text-neutral-300 px-2.5 py-1 rounded-full transition"
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
