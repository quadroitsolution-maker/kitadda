"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductGrid } from "@/components/ProductGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { PRODUCTS } from "@/data/products";
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ArrowRight,
  Type
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
  const [products, setProducts] = useState(PRODUCTS);

  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.warn("Live products fetch fallback to static:", err));
  }, []);

  React.useEffect(() => {
    const handleCategoryEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSelectedCategory(customEvent.detail);
        const dropsElement = document.getElementById("latest-drops");
        if (dropsElement) {
          dropsElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
    window.addEventListener("kitadda:selectCategory", handleCategoryEvent);
    return () => window.removeEventListener("kitadda:selectCategory", handleCategoryEvent);
  }, []);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    const dropsElement = document.getElementById("latest-drops");
    if (dropsElement) {
      dropsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col text-neutral-100 selection:bg-[#C5A059] selection:text-[#0A0D14]">
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
        <ProductGrid
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 5. Trust & Quality Banner */}
        <section className="py-10 sm:py-14 bg-[#0B0E17] border-y border-[#1C2438]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-3.5 sm:p-5 rounded-none bg-[#0E131F] border border-[#1C2438]">
                <div className="p-2 sm:p-3 rounded-none bg-[#0B132B] border border-[#1C2438] text-[#DFB76C] shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white font-jersey">
                    Match-Spec Quality
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Authentic crest embroidery and dri-fit fabric.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-3.5 sm:p-5 rounded-none bg-[#0E131F] border border-[#1C2438]">
                <div className="p-2 sm:p-3 rounded-none bg-[#0B132B] border border-[#1C2438] text-[#DFB76C] shrink-0">
                  <Type className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white font-jersey">
                    Custom Printing
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Official heat-pressed player name &amp; number.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-3.5 sm:p-5 rounded-none bg-[#0E131F] border border-[#1C2438]">
                <div className="p-2 sm:p-3 rounded-none bg-[#0B132B] border border-[#1C2438] text-[#DFB76C] shrink-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white font-jersey">
                    Express Shipping
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Fast dispatch. Free shipping on orders over ₹1499.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-3.5 sm:p-5 rounded-none bg-[#0E131F] border border-[#1C2438]">
                <div className="p-2 sm:p-3 rounded-none bg-[#0B132B] border border-[#1C2438] text-[#DFB76C] shrink-0">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white font-jersey">
                    7-Day Exchange
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Hassle-free sizing exchange guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Instagram Community Section (@kit.adda) */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#DFB76C] text-xs font-bold uppercase tracking-widest mb-1">
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>@kit.adda</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-jersey">
                Seen on Pitch &amp; Streets
              </h2>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-[#DFB76C] uppercase tracking-wider group"
            >
              <span>Follow @kit.adda for daily drops</span>
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
                className="group relative aspect-square rounded-none overflow-hidden bg-[#0E131F] border border-[#1C2438] hover:border-[#C5A059]/60"
              >
                <Image
                  src={post.img}
                  alt={post.tag}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#DFB76C]">
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

      {/* 10. Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
