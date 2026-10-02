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
    <section className="py-10 sm:py-16 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
      {/* Centered Minimal Header matching reference layout */}
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-wider font-jersey inline-block">
          FEATURED CATEGORY
        </h2>
        {/* Minimal double-line accent underline */}
        <div className="flex justify-center mt-1.5">
          <svg
            className="w-48 sm:w-64 h-3 text-[#C5A059]"
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

      {/* 4 Large Square Tiles - Wide & Filled Editorial Feel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <div
              key={category.id}
              onClick={() => onSelectCategory && onSelectCategory(category.id)}
              className="group cursor-pointer flex flex-col items-center w-full"
            >
              {/* Large Pure Square Image Frame */}
              <div
                className={`relative aspect-square w-full overflow-hidden bg-[#0A0D14] transition-all duration-300 ${
                  isSelected ? "ring-2 ring-[#C5A059]" : ""
                }`}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Bold Uppercase Title Centered Under Image */}
              <h3 className="mt-3 sm:mt-3.5 text-xs sm:text-sm md:text-base font-black uppercase text-white tracking-wider font-jersey text-center group-hover:text-[#DFB76C] transition-colors">
                {category.name}
              </h3>
            </div>
          );
        })}
      </div>
    </section>
  );
};
