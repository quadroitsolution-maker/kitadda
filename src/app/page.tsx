"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductGrid } from "@/components/ProductGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Footer } from "@/components/Footer";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/types";
import { 
  Flame, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  ArrowRight,
  Star
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

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    // Smooth scroll down to latest drops
    const dropsElement = document.getElementById("latest-drops");
    if (dropsElement) {
      dropsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-neutral-100 selection:bg-emerald-500 selection:text-black">
      {/* 1. Header with Mega Menu */}
      <Header />

      <main className="flex-1">
        {/* 2. Hero Carousel with Kit Adda Copy */}
        <HeroCarousel />

        {/* 3. Category Grid */}
        <CategoryGrid
          onSelectCategory={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        {/* 4. Latest Drops 4-Column Product Grid */}
        <ProductGrid products={PRODUCTS} />

        {/* 5. Trust & Quality Banner */}
        <section className="py-14 bg-gradient-to-b from-[#09090b] via-[#0d0d12] to-[#09090b] border-y border-neutral-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#121216] border border-neutral-800/90">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-white font-jersey">
                    Master Grade Guarantee
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Laser-cut vents, high-density crest embroidery, and genuine match-day dri-fit fabric.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#121216] border border-neutral-800/90">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-white font-jersey">
                    Custom Print Studio
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Official league font typography. Add your favorite star or personalized name & number.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#121216] border border-neutral-800/90">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-white font-jersey">
                    Pan-India Express ⚡
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Fast dispatch with Bluedart & Delhivery. Free express shipping on orders over ₹1499.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#121216] border border-neutral-800/90">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-white font-jersey">
                    Hassle-Free Exchange
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    7-day sizing exchange warranty. We ensure your kit fits like matchday armor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Instagram Community Vibe Section (@kit.adda) */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-pink-500 text-xs font-black uppercase tracking-widest mb-1.5">
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram Native • @kit.adda</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-jersey">
                Seen on the Pitch & Streets
              </h2>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-white uppercase tracking-wider group"
            >
              <span>Follow @kit.adda for daily kit drops</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80",
                user: "@rohit_cfc",
                tag: "Bellingham #5 Real Madrid",
              },
              {
                img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80",
                user: "@varun_gooner",
                tag: "Arsenal Heritage Away",
              },
              {
                img: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=600&q=80",
                user: "@samrat_afc",
                tag: "Messi 3-Stars World Champions",
              },
              {
                img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
                user: "@arjun_mufc",
                tag: "Ronaldo 07/08 Moscow Retro",
              },
            ].map((post, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800"
              >
                <Image
                  src={post.img}
                  alt={post.tag}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400">
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>{post.user}</span>
                  </div>
                  <div className="text-xs text-white font-medium line-clamp-1 mt-0.5">
                    {post.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <Footer />

      {/* 8. Slide-out Cart Drawer */}
      <CartDrawer />

      {/* 9. Breeze 1-Click Checkout Modal with Razorpay */}
      <CheckoutModal />
    </div>
  );
}
