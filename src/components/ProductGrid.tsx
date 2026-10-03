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
    { id: "world-cup", label: "WORLD CUP" },
    { id: "accessories", label: "GRIP SOCKS" },
  ];

  const filteredProducts = activeFilter === "all"
    ? products
    : products.filter((p) => p.category === activeFilter);

  return (
    <section id="latest-drops" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Filter Tabs - Left-aligned & minimal */}
      <div className="flex flex-col items-start gap-3.5 sm:gap-4 mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-jersey">
          Latest Drops
        </h2>

        {/* Filter Tabs - Left aligned directly below heading */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleFilterChange(filter.id)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-none text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
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

      {/* 4-Column Minimal Grid - No Extra Boxes, No Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block"
          >
            {/* Pure Clean Image Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0A0D14]">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Minimal Product Info - Clean Title & Price */}
            <div className="mt-3">
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug group-hover:text-[#DFB76C] transition-colors">
                {product.title}
              </h3>
              <div className="mt-1 text-sm sm:text-base font-black text-white font-jersey">
                ₹{product.price.toLocaleString("en-IN")}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
