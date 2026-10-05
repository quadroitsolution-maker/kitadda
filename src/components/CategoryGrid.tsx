"use client";

import React from "react";
import Image from "next/image";
import { CATEGORIES } from "@/data/products";

interface CategoryGridProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section className="py-8 sm:py-16 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
      {/* Centered Minimal Header */}
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-wider font-jersey inline-block">
          FEATURED CATEGORY
        </h2>
        {/* Minimal double-line accent underline */}
        <div className="flex justify-center mt-1 sm:mt-1.5">
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

      {/* 4 Square Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
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
                className={`relative aspect-square w-full overflow-hidden bg-[#0A0D14] border border-[#1C2438] transition-all duration-300 ${
                  isSelected ? "ring-2 ring-[#C5A059] border-[#C5A059]" : "group-hover:border-[#C5A059]/50"
                }`}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2 right-2 text-center sm:hidden">
                  <span className="text-[10px] font-black uppercase text-white font-jersey tracking-wider bg-[#0A0D14]/85 px-2 py-0.5 border border-[#1C2438] inline-block">
                    {category.name}
                  </span>
                </div>
              </div>

              {/* Bold Uppercase Title Centered Under Image on Tablet/Desktop */}
              <h3 className="hidden sm:block mt-3 text-xs sm:text-sm md:text-base font-black uppercase text-white tracking-wider font-jersey text-center group-hover:text-[#DFB76C] transition-colors">
                {category.name}
              </h3>
            </div>
          );
        })}
      </div>
    </section>
  );
};
