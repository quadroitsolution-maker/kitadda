"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/data/products";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface CategoryGridProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight font-jersey">
            Shop By Collection
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md">
          Explore iconic club jerseys, international tournament editions, vintage retro drops, and modern football streetwear.
        </p>
      </div>

      {/* Bubble / Card Grid with mobile horizontal swipe */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <div
              key={category.id}
              onClick={() => onSelectCategory && onSelectCategory(category.id)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-[#121215] border transition-all duration-300 hover:-translate-y-1.5 ${
                isSelected
                  ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "border-neutral-800/80 hover:border-neutral-700"
              }`}
            >
              {/* Image with dark gradient and zoom effect */}
              <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/40 to-transparent" />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md rounded-full p-1.5 text-neutral-300 group-hover:text-emerald-400 group-hover:bg-black transition">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                
                {/* Micro bubble badge */}
                <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-neutral-200">
                  {category.count}
                </div>
              </div>

              {/* Bottom text info */}
              <div className="p-4 bg-[#121215]">
                <h3 className="text-base sm:text-lg font-black uppercase text-white group-hover:text-emerald-400 transition-colors font-jersey">
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
