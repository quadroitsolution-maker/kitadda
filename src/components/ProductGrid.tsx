"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
}) => {
  const [internalFilter, setInternalFilter] = useState<string>("all");
  const activeFilter = selectedCategory !== undefined ? selectedCategory : internalFilter;

  const handleFilterChange = (id: string) => {
    setInternalFilter(id);
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  const filters = [
    { id: "all", label: "ALL" },
    { id: "player-version", label: "PLAYER VERSION" },
    { id: "fan-version", label: "FAN VERSION" },
    { id: "accessories", label: "GRIP SOCKS" },
    { id: "world-cup", label: "WORLD CUP" },
  ];

  const filteredProducts = activeFilter === "all"
    ? products
    : products.filter((p) => p.category === activeFilter);

  return (
    <section id="latest-drops" className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col items-start gap-3 sm:gap-4 mb-6 sm:mb-10">
        <div className="flex items-baseline justify-between w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-jersey">
            Latest Drops
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {filteredProducts.length} KITS
          </span>
        </div>

        {/* Filter Tabs - Smooth horizontal scroll on mobile with touch support */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 pt-0.5 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleFilterChange(filter.id)}
                className={`min-h-[40px] px-3.5 py-2 rounded-none text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border active:scale-95 ${
                  isActive
                    ? "bg-[#C5A059] text-[#0A0D14] border-[#C5A059] font-black"
                    : "bg-[#0B101D] text-neutral-300 hover:text-white hover:bg-[#12192B] border-[#1C253B] hover:border-[#C5A059]/40"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Mobile Grid, 4-Column Desktop Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block active:scale-[0.98] transition-transform select-none"
          >
            {/* Pure Clean Image Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0A0D14] border border-[#1C2438] group-hover:border-[#C5A059]/50 transition-colors">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Optional Badge */}
              {product.badge && (
                <div className="absolute top-2 left-2 bg-[#0B132B]/90 border border-[#C5A059]/40 text-[#DFB76C] text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 tracking-wider">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Minimal Product Info */}
            <div className="mt-2.5 sm:mt-3">
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug group-hover:text-[#DFB76C] transition-colors">
                {product.title}
              </h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm sm:text-base font-black text-white font-jersey">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.compare_at_price > product.price && (
                  <span className="text-[11px] sm:text-xs text-neutral-500 line-through">
                    ₹{product.compare_at_price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
