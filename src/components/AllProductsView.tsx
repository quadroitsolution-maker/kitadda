"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ShoppingBag,
  RotateCcw,
  Check,
  Filter,
} from "lucide-react";

interface AllProductsViewProps {
  initialProducts: Product[];
}

export const AllProductsView: React.FC<AllProductsViewProps> = ({ initialProducts }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const initialCategory = searchParams.get("category") || "all";
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [priceFilter, setPriceFilter] = useState<"all" | "under-1200" | "1200-1400" | "above-1400">("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Sync category from URL query parameters if present
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      router.replace("/products", { scroll: false });
    } else {
      router.replace(`/products?category=${catId}`, { scroll: false });
    }
  };

  // Fetch latest products from API in case of updates
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { id: "all", label: "All Drops" },
    { id: "player-version", label: "Player Version" },
    { id: "fan-version", label: "Fan Version" },
    { id: "accessories", label: "Grip Socks" },
    { id: "world-cup", label: "World Cup" },
  ];

  // Extract unique leagues from current products
  const leagues = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.league).filter(Boolean)));
    return ["all", ...list];
  }, [products]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedLeague !== "all") count++;
    if (searchQuery.trim() !== "") count++;
    if (priceFilter !== "all") count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, selectedLeague, searchQuery, priceFilter, inStockOnly]);

  const resetFilters = () => {
    handleCategoryChange("all");
    setSelectedLeague("all");
    setSearchQuery("");
    setPriceFilter("all");
    setInStockOnly(false);
    setSortBy("featured");
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => {
        if (selectedCategory === "player-version") {
          return p.category === "player-version" || p.version_type === "Player Version";
        }
        if (selectedCategory === "fan-version") {
          return p.category === "fan-version" || p.version_type === "Fan Version";
        }
        return p.category === selectedCategory;
      });
    }

    // 2. League filter
    if (selectedLeague !== "all") {
      list = list.filter((p) => p.league === selectedLeague);
    }

    // 3. Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q) ||
          p.league.toLowerCase().includes(q) ||
          (p.badge && p.badge.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 4. Price range
    if (priceFilter === "under-1200") {
      list = list.filter((p) => p.price < 1200);
    } else if (priceFilter === "1200-1400") {
      list = list.filter((p) => p.price >= 1200 && p.price <= 1400);
    } else if (priceFilter === "above-1400") {
      list = list.filter((p) => p.price > 1400);
    }

    // 5. In-stock only
    if (inStockOnly) {
      list = list.filter((p) => p.stock_status !== "out_of_stock");
    }

    // 6. Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [products, selectedCategory, selectedLeague, searchQuery, priceFilter, inStockOnly, sortBy]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product,
      size: "L",
      version: product.version_type || "Fan Version",
      custom_name: "",
      custom_number: "",
      patches: false,
      patch_fee: 0,
      unit_price: product.price,
      quantity: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 lg:pb-16 text-neutral-200 cursor-football">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-400 mb-4 sm:mb-6 overflow-x-auto scrollbar-none pb-1">
        <Link href="/" className="hover:text-[#DFB76C] transition shrink-0">
          Home
        </Link>
        <span>/</span>
        <span className="text-white shrink-0">All Products</span>
        {selectedCategory !== "all" && (
          <>
            <span>/</span>
            <span className="text-[#DFB76C] capitalize truncate max-w-[150px]">
              {selectedCategory.replace("-", " ")}
            </span>
          </>
        )}
      </nav>

      {/* 2. Collection Hero Banner (No Star Emoji) */}
      <div className="border-b border-[#1C2438] pb-6 sm:pb-8 mb-8 sm:mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#DFB76C] mb-1 font-mono">
              THE OFFICIAL VAULT
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-jersey">
              All Football Kits
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
              Curated master-grade football jerseys, player and fan version drops, retro editions, and anti-slip grip accessories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400 bg-[#0E131F] border border-[#1C2438] px-3.5 py-2 font-bold">
              {filteredProducts.length} {filteredProducts.length === 1 ? "KIT" : "KITS"} FOUND
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-[#DFB76C] hover:text-white bg-[#0B132B] border border-[#C5A059]/40 px-3.5 py-2 font-bold uppercase tracking-wider transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Grid Layout: Left Sidebar Filters + Right Product Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
        {/* ===================== LEFT SIDEBAR FILTERS (DESKTOP) ===================== */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2438]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#DFB76C]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Filters &amp; Refine
                </span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-[#DFB76C] hover:underline font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Search Kits
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Club, player, edition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] rounded-none pl-9 pr-8 py-2 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="w-7 h-7 flex items-center justify-center absolute right-1 top-0.5 text-neutral-400 hover:text-white"
                    aria-label="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-2.5 pt-2 border-t border-[#1C2438]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Category
              </div>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition border ${
                        isSelected
                          ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C] font-bold"
                          : "bg-[#0E131F]/50 border-transparent text-neutral-300 hover:bg-[#0E131F] hover:text-white"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#DFB76C]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leagues Filter */}
            <div className="space-y-2.5 pt-2 border-t border-[#1C2438]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                League &amp; Competition
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {leagues.map((lg) => {
                  const isSelected = selectedLeague === lg;
                  return (
                    <button
                      key={lg}
                      type="button"
                      onClick={() => setSelectedLeague(lg)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between transition border ${
                        isSelected
                          ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C] font-bold"
                          : "bg-[#0E131F]/50 border-transparent text-neutral-300 hover:bg-[#0E131F] hover:text-white"
                      }`}
                    >
                      <span className="truncate">{lg === "all" ? "All Leagues" : lg}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#DFB76C] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5 pt-2 border-t border-[#1C2438]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Price Range
              </div>
              <div className="space-y-1">
                {[
                  { id: "all", label: "All Prices" },
                  { id: "under-1200", label: "Under ₹1,200" },
                  { id: "1200-1400", label: "₹1,200 – ₹1,400" },
                  { id: "above-1400", label: "Above ₹1,400" },
                ].map((p) => {
                  const isSelected = priceFilter === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriceFilter(p.id as typeof priceFilter)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between transition border ${
                        isSelected
                          ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C] font-bold"
                          : "bg-[#0E131F]/50 border-transparent text-neutral-300 hover:bg-[#0E131F] hover:text-white"
                      }`}
                    >
                      <span>{p.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#DFB76C]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2 border-t border-[#1C2438]">
              <label className="flex items-center justify-between cursor-pointer select-none p-3 bg-[#0E131F] border border-[#1C2438] hover:border-[#C5A059]/40 transition">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  In Stock Only
                </span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#C5A059] rounded-none cursor-pointer"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* ===================== RIGHT PRODUCTS CATALOG ===================== */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Control Bar (Mobile Filter Button + Search on Mobile + Sort Dropdown) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0E131F] border border-[#1C2438] p-3">
            {/* Mobile Filter Button & Mobile Search */}
            <div className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex-1 sm:flex-none h-10 px-4 bg-[#0B132B] border border-[#C5A059]/50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#DFB76C]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-[#C5A059] text-[#0A0D14] text-[10px] font-black px-1.5 py-0.2 font-mono">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="lg:hidden relative flex-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-[#1C2438] focus:border-[#C5A059] rounded-none pl-8 pr-7 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Product Count (Desktop) */}
              <div className="hidden lg:block text-xs font-mono text-neutral-400">
                Showing <strong className="text-white">{filteredProducts.length}</strong> items
              </div>
            </div>

            {/* Sort Selector */}
            <div className="relative min-w-[180px]">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  aria-label="Sort products"
                  className="w-full h-10 bg-[#0A0D14] border border-[#1C2438] focus:border-[#C5A059] rounded-none pl-3 pr-8 text-xs font-bold text-white uppercase tracking-wider appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured Drops</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-500 text-[11px] uppercase font-bold tracking-wider font-mono">
                Active:
              </span>

              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-[#0B132B] border border-[#C5A059]/40 text-[#DFB76C] px-2.5 py-1 uppercase font-bold text-[11px]">
                  <span>Category: {selectedCategory.replace("-", " ")}</span>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("all")}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedLeague !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-[#0B132B] border border-[#C5A059]/40 text-[#DFB76C] px-2.5 py-1 uppercase font-bold text-[11px]">
                  <span>League: {selectedLeague}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedLeague("all")}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {priceFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-[#0B132B] border border-[#C5A059]/40 text-[#DFB76C] px-2.5 py-1 uppercase font-bold text-[11px]">
                  <span>
                    Price:{" "}
                    {priceFilter === "under-1200"
                      ? "Under ₹1,200"
                      : priceFilter === "1200-1400"
                      ? "₹1,200 - ₹1,400"
                      : "Above ₹1,400"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPriceFilter("all")}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-[#0B132B] border border-[#C5A059]/40 text-[#DFB76C] px-2.5 py-1 font-bold text-[11px]">
                  <span>Query: &quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="text-neutral-400 hover:text-white underline text-[11px] ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-[#0E131F] border border-[#1C2438] p-8 space-y-4">
              <div className="w-12 h-12 rounded-none bg-[#0B132B] border border-[#1C2438] mx-auto flex items-center justify-center text-[#DFB76C]">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase text-white font-jersey">
                  No matching kits in the vault
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  We couldn&apos;t find any jerseys matching your active filters. Try resetting your filters.
                </p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] text-xs font-black uppercase px-6 py-3 rounded-none transition active:scale-95"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
              {filteredProducts.map((product) => {
                const discount = Math.round(
                  ((product.compare_at_price - product.price) / product.compare_at_price) * 100
                );

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block active:scale-[0.98] transition-transform select-none"
                  >
                    {/* Product Image Frame */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0A0D14] border border-[#1C2438] group-hover:border-[#C5A059]/60 transition-colors">
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Version tag */}
                      <div className="absolute bottom-2 left-2 bg-[#0A0D14]/85 border border-[#1C2438] text-neutral-300 text-[9px] uppercase px-1.5 py-0.5 font-mono">
                        {product.version_type || "Fan Edition"}
                      </div>

                      {/* Quick Add Button Overlay */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="hidden sm:flex absolute bottom-2 right-2 w-9 h-9 items-center justify-center bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        aria-label={`Quick add ${product.title}`}
                        title="Quick add to bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Product Metadata */}
                    <div className="mt-2.5 sm:mt-3">
                      <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider truncate">
                        {product.team} • {product.season}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug group-hover:text-[#DFB76C] transition-colors mt-0.5">
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
                        {discount > 0 && (
                          <span className="text-[10px] text-[#DFB76C] font-mono font-bold hidden sm:inline">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ===================== MOBILE SLIDE-OVER FILTER DRAWER ===================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-[85%] max-w-sm bg-[#0A0D14] border-l border-[#1C2438] h-full p-5 flex flex-col justify-between overflow-y-auto z-10">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1C2438]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#DFB76C]" />
                  <span className="text-base font-black uppercase text-white font-jersey">
                    Filters &amp; Refine
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="py-4 border-b border-[#1C2438] space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 font-jersey">
                  Categories
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`p-2.5 text-left text-xs font-bold uppercase flex items-center justify-between border ${
                          isSelected
                            ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C]"
                            : "bg-[#0E131F] border-[#1C2438] text-neutral-400"
                        }`}
                      >
                        <span>{cat.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#DFB76C]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* League Filter */}
              <div className="py-4 border-b border-[#1C2438] space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 font-jersey">
                  League &amp; Competition
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {leagues.map((lg) => {
                    const isSelected = selectedLeague === lg;
                    return (
                      <button
                        key={lg}
                        type="button"
                        onClick={() => setSelectedLeague(lg)}
                        className={`p-2 text-center text-[11px] font-bold uppercase truncate border ${
                          isSelected
                            ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C]"
                            : "bg-[#0E131F] border-[#1C2438] text-neutral-400"
                        }`}
                      >
                        {lg === "all" ? "All Leagues" : lg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="py-4 border-b border-[#1C2438] space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 font-jersey">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "all", label: "All Prices" },
                    { id: "under-1200", label: "< ₹1,200" },
                    { id: "1200-1400", label: "₹1,200 - ₹1,400" },
                    { id: "above-1400", label: "> ₹1,400" },
                  ].map((p) => {
                    const isSelected = priceFilter === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriceFilter(p.id as typeof priceFilter)}
                        className={`p-2 text-center text-[11px] font-bold uppercase border ${
                          isSelected
                            ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C]"
                            : "bg-[#0E131F] border-[#1C2438] text-neutral-400"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* In Stock Only Switch */}
              <div className="py-4 space-y-2">
                <label className="flex items-center justify-between cursor-pointer select-none p-2.5 bg-[#0E131F] border border-[#1C2438]">
                  <span className="text-xs font-bold uppercase text-white tracking-wider">
                    In Stock Only
                  </span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#C5A059] rounded-none"
                  />
                </label>
              </div>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="pt-4 border-t border-[#1C2438] space-y-2 pb-safe">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] font-black uppercase text-xs tracking-wider py-3.5 rounded-none active:scale-95 transition"
              >
                Show {filteredProducts.length} Results
              </button>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full bg-[#0E131F] border border-[#1C2438] text-neutral-300 font-bold uppercase text-xs py-2.5 rounded-none active:scale-95 transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
