"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingBag, 
  Check, 
  Eye
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
    { id: "player-version", label: "Player Version" },
    { id: "fan-version", label: "Fan Version" },
    { id: "world-cup", label: "World Cup" },
    { id: "accessories", label: "Grip Socks" },
  ];

  const filteredProducts = activeFilter === "all"
    ? products
    : products.filter((p) => p.category === activeFilter);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

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
          <div className="text-[#DFB76C] text-xs font-bold uppercase tracking-widest mb-1.5">
            Official Drops • 100% Master Grade
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-jersey">
            Latest Drops
          </h2>
        </div>

        {/* Filter Pills - Sharp Boxy Minimal */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
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

      {/* 4-Column Responsive Grid with Sharp Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => {
          const discountPct = Math.round(
            ((product.compare_at_price - product.price) / product.compare_at_price) * 100
          );

          return (
            <div
              key={product.id}
              className="group relative bg-[#0E131F] border border-[#1C2438] hover:border-[#C5A059]/70 rounded-none overflow-hidden flex flex-col justify-between transition-all duration-200"
            >
              <Link href={`/products/${product.id}`} className="block flex-1">
                {/* Product Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0A0D14]">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    {product.badge && (
                      <span className="bg-[#0B132B] text-[#DFB76C] border border-[#C5A059]/50 text-[10px] font-bold uppercase px-2 py-0.5 rounded-none tracking-wider">
                        {product.badge}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="bg-[#1C2438] text-white border border-[#2B3854] text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-none tracking-wider">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Stock Status indicator */}
                  {product.stock_status === "low_stock" && (
                    <div className="absolute bottom-2.5 left-2.5 bg-[#0B132B]/90 text-[#DFB76C] border border-[#C5A059]/40 text-[10px] font-bold px-2 py-0.5 rounded-none">
                      Low Stock
                    </div>
                  )}

                  {/* Quick View overlay button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <span className="bg-[#0B132B] text-[#DFB76C] border border-[#C5A059]/60 font-bold text-xs px-4 py-2 rounded-none flex items-center gap-1.5 uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5" />
                      View & Customize
                    </span>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[#DFB76C] font-bold mb-1">
                      {product.team} • {product.season}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#DFB76C] transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  {/* Pricing Details */}
                  <div className="mt-3 pt-2.5 border-t border-[#1C2438] flex items-baseline gap-2">
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
                  className={`w-full py-2.5 px-3 rounded-none font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    recentlyAddedId === product.id
                      ? "bg-[#C5A059] text-[#0A0D14]"
                      : "bg-[#0B132B] hover:bg-[#C5A059] text-neutral-200 hover:text-[#0A0D14] border border-[#1C2438] hover:border-[#C5A059]"
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
