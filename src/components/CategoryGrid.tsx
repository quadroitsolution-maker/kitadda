"use client";

import React from "react";
import Image from "next/image";
import { CATEGORIES } from "@/data/products";
import { Reveal } from "@/components/Reveal";

interface CategoryGridProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section className="py-12 sm:py-20 w-full bg-[#F7F8FA] border-y border-[#E2E6EE] text-[#0A0D14] cursor-football">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Minimal Header with Vertical Reveal */}
        <Reveal direction="up" delayMs={0}>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0A0D14] uppercase tracking-tight font-jersey inline-block">
              FEATURED CATEGORY
            </h2>
            {/* Minimal double-line accent underline */}
            <div className="flex justify-center mt-1.5 sm:mt-2">
              <svg
                className="w-40 sm:w-64 h-2.5 sm:h-3 text-[#C5A059]"
                viewBox="0 0 220 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 6C65 2 155 3 215 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M25 10C85 6 150 7 195 9"
                  stroke="#DFB76C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>
        </Reveal>

        {/* 4 Square Tiles with Unified Vertical Entrance */}
        <Reveal direction="up" delayMs={60}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <div
                  key={category.id}
                  onClick={() => onSelectCategory && onSelectCategory(category.id)}
                  className="group cursor-pointer flex flex-col items-center w-full active:scale-[0.97] transition-transform select-none"
                >
                  {/* Large Pure Square Image Frame */}
                  <div
                    className={`relative aspect-square w-full overflow-hidden bg-neutral-200 border transition-all duration-300 shadow-sm ${
                      isSelected
                        ? "ring-2 ring-[#0A0D14] border-[#0A0D14]"
                        : "border-[#E2E6EE] group-hover:border-[#0A0D14]"
                    }`}
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 text-center sm:hidden">
                      <span className="text-[10px] font-black uppercase text-white font-jersey tracking-wider bg-[#0A0D14]/90 px-2 py-0.5 border border-[#1C2438] inline-block">
                        {category.name}
                      </span>
                    </div>
                  </div>

                  {/* Bold Uppercase Title Centered Under Image on Tablet/Desktop */}
                  <h3 className="hidden sm:block mt-3 text-xs sm:text-sm md:text-base font-black uppercase text-[#0A0D14] tracking-wider font-jersey text-center group-hover:text-[#C5A059] transition-colors">
                    {category.name}
                  </h3>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
