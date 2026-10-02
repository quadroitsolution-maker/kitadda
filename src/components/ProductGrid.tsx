"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "player-version", label: "Player Version" },
    { id: "fan-version", label: "Fan Version" },
    { id: "world-cup", label: "World Cup" },
    { id: "accessories", label: "Grip Socks" },
  ];

  const filteredProducts = activeFilter === "all"
    ? products
    : products.filter((p) => p.category === activeFilter);

  return (
    <section id="latest-drops" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-jersey">
            Latest Drops
          </h2>
        </div>

        {/* Filter Tabs - Minimal Sharp Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-[#C5A059] text-[#0A0D14] border-[#C5A059]"
                    : "bg-[#0E131F] text-neutral-400 hover:text-white hover:bg-[#162035] border-[#1C2438]"
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
