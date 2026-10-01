"use client";

import React from "react";
import Image from "next/image";
import { CATEGORIES } from "@/data/products";
import { ArrowUpRight } from "lucide-react";

interface CategoryGridProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#1C2438]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="text-[#DFB76C] text-xs font-bold uppercase tracking-widest mb-1">
            Categories
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-jersey">
            Featured Collections
          </h2>
        </div>
        <p className="text-xs text-neutral-400">
          Current season player &amp; fan jerseys, grip socks, and world cup editions.
        </p>
      </div>

      {/* Sharp Boxy Minimal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <div
              key={category.id}
              onClick={() => onSelectCategory && onSelectCategory(category.id)}
              className={`group relative rounded-none overflow-hidden cursor-pointer bg-[#0E131F] border transition-all duration-200 ${
                isSelected
                  ? "border-[#C5A059] bg-[#0E1A36]"
                  : "border-[#1C2438] hover:border-[#C5A059]/60"
              }`}
            >
              {/* Image Container with Sharp Frame */}
              <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute top-3 right-3 bg-[#0B132B]/90 border border-[#1C2438] rounded-none p-1.5 text-neutral-300 group-hover:text-[#DFB76C] group-hover:border-[#C5A059]/50 transition">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                
                {/* Minimal Counter Badge */}
                <div className="absolute top-3 left-3 bg-[#0B132B]/90 border border-[#1C2438] rounded-none px-2.5 py-0.5 text-[10px] font-bold text-[#DFB76C] tracking-wider">
                  {category.count}
                </div>
              </div>

              {/* Bottom text info */}
              <div className="p-4 bg-[#0E131F] border-t border-[#1C2438]">
                <h3 className="text-base sm:text-lg font-black uppercase text-white group-hover:text-[#DFB76C] transition-colors font-jersey">
                  {category.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                  {category.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
