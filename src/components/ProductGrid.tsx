"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingBag, 
  Sparkles, 
  SlidersHorizontal, 
  Check, 
  Eye, 
  ArrowRight,
  Flame
} from "lucide-react";

interface ProductGridProps {
  products: Product[];
  onOpenQuickCustomize?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onOpenQuickCustomize,
}) => {
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const filters = [
    { id: "all", label: "All Drops" },
    { id: "club", label: "Club Kits" },
    { id: "international", label: "International" },
    { id: "retro", label: "Retro Vault" },
    { id: "jackets", label: "Jackets" },
  ];

  const filteredProducts = activeFilter === "all"
    ? products
    : products.filter((p) => p.category === activeFilter);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has customization, opening the customizer is ideal; otherwise quick add standard size L
    if (onOpenQuickCustomize) {
      onOpenQuickCustomize(product);
      return;
    }

    addToCart({
      product,
      size: "L",
      version: "Fan Version",
      custom_name: "",
      custom_number: "",
      patches: false,
      patch_fee: 0,
      unit_price: product.price,
      quantity: 1,
    });

    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1500);
  };

  return (
    <section id="latest-drops" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Official Drops • 100% Master Grade</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-jersey">
            Latest Drops
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                    : "bg-[#141418] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Column Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => {
          const discountPct = Math.round(
            ((product.compare_at_price - product.price) / product.compare_at_price) * 100
          );

          return (
            <div
              key={product.id}
              className="group relative bg-[#121215] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/60"
            >
              <Link href={`/products/${product.id}`} className="block flex-1">
                {/* Product Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient bottom shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    {product.badge && (
                      <span className="bg-emerald-500/90 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded shadow tracking-wider">
                        {product.badge}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="bg-red-500/90 text-white text-[10px] font-black uppercase px-1.5 py-0.5 rounded shadow tracking-wider">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Stock Status indicator */}
                  {product.stock_status === "low_stock" && (
                    <div className="absolute bottom-2.5 left-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                      Low Stock
                    </div>
                  )}

                  {/* Quick View overlay button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <span className="bg-white text-black font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 uppercase tracking-wider transform translate-y-2 group-hover:translate-y-0 transition-transform shadow-lg">
                      <Eye className="w-3.5 h-3.5" />
                      Customize & View
                    </span>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold mb-1">
                      {product.team} • {product.season}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  {/* Pricing Details */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-black text-white font-jersey">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.compare_at_price > product.price && (
                      <span className="text-xs text-neutral-500 line-through">
                        ₹{product.compare_at_price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Add to Cart / Quick Customize Button */}
              <div className="p-3.5 sm:p-4 pt-0">
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(e, product)}
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                    recentlyAddedId === product.id
                      ? "bg-emerald-500 text-black"
                      : "bg-neutral-800 hover:bg-emerald-500 text-neutral-200 hover:text-black border border-neutral-700/80 hover:border-emerald-500"
                  }`}
                >
                  {recentlyAddedId === product.id ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Customize / Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
