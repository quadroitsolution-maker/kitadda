"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { CustomizationForm } from "@/components/CustomizationForm";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  ShoppingBag,
  Zap,
  Check,
  Ruler,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductDetailsViewProps {
  product: Product;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({ product }) => {
  const { addToCart, setIsCartOpen, setIsCheckoutOpen } = useCart();

  const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L" | "XL" | "XXL">("L");
  const [selectedVersion, setSelectedVersion] = useState<"Fan Version" | "Player Version">(
    product.version_type || "Fan Version"
  );
  const [quantity, setQuantity] = useState(1);

  // Touch Swipe for mobile gallery
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentImgIdx = galleryImages.indexOf(selectedImage);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40;

    if (diff > threshold) {
      // Swipe left -> Next image
      const nextIdx = (currentImgIdx + 1) % galleryImages.length;
      setSelectedImage(galleryImages[nextIdx]);
    } else if (diff < -threshold) {
      // Swipe right -> Prev image
      const prevIdx = (currentImgIdx - 1 + galleryImages.length) % galleryImages.length;
      setSelectedImage(galleryImages[prevIdx]);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Customization state
  const patchFee = 150;
  const [customization, setCustomization] = useState({
    playerName: "",
    playerNumber: "",
    addPatches: false,
    patchType: "UCL Starball & Respect Badge",
    totalPrice: product.price,
  });

  // Accordion active state
  const [openAccordion, setOpenAccordion] = useState<string | null>("size-guide");

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const discountPct = Math.round(
    ((product.compare_at_price - product.price) / product.compare_at_price) * 100
  );

  const finalUnitPrice = customization.totalPrice;

  const handleAddToCart = () => {
    addToCart({
      product,
      size: selectedSize,
      version: selectedVersion,
      custom_name: customization.playerName,
      custom_number: customization.playerNumber,
      patches: customization.addPatches,
      patch_fee: customization.addPatches ? patchFee : 0,
      unit_price: finalUnitPrice,
      quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-12 pb-32 lg:pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-400 mb-4 sm:mb-6 overflow-x-auto scrollbar-none pb-1">
        <Link href="/" className="hover:text-[#DFB76C] transition shrink-0">
          Home
        </Link>
        <span>/</span>
        <Link href="/#latest-drops" className="hover:text-[#DFB76C] transition capitalize shrink-0">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-[180px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        {/* Left Column: Image Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          {/* Main Hero Image with Mobile Touch Swipe */}
          <div
            className="relative aspect-[3/4] w-full rounded-none overflow-hidden bg-[#0E131F] border border-[#1C2438] select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={selectedImage}
              alt={product.title}
              fill
              priority
              className="object-cover object-center transition-all duration-300"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#0B132B] text-[#DFB76C] text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 rounded-none border border-[#C5A059]/50 tracking-wider">
                {product.badge}
              </span>
            )}

            {/* Mobile swipe counter */}
            {galleryImages.length > 1 && (
              <div className="absolute top-3 right-3 sm:hidden bg-black/70 backdrop-blur-sm border border-[#1C2438] text-[10px] font-mono text-neutral-300 px-2 py-0.5 font-bold">
                {currentImgIdx + 1} / {galleryImages.length}
              </div>
            )}

            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-[#0B132B]/90 border border-[#1C2438] rounded-none px-2.5 py-1 text-[11px] sm:text-xs font-bold text-neutral-300 flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm">
              <div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full overflow-hidden border border-[#C5A059]/40 shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Kit Adda Verified"
                  fill
                  sizes="16px"
                  className="object-cover object-center"
                />
              </div>
              <span>Master Grade Quality</span>
            </div>
          </div>

          {/* Thumbnails row */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-none overflow-hidden shrink-0 border-2 transition active:scale-95 ${
                    selectedImage === img
                      ? "border-[#C5A059]"
                      : "border-[#1C2438] hover:border-neutral-600 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details, Customizer & Buy Action */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          <div>
            <div className="text-[#DFB76C] text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2 font-mono">
              {product.team} • {product.season} Drop
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight font-jersey leading-tight">
              {product.title}
            </h1>

            {/* Social Proof Rating */}
            <div className="flex items-center gap-2.5 mt-2.5 sm:mt-3">
              <span className="text-xs font-black text-[#DFB76C] bg-[#0B132B] border border-[#C5A059]/40 px-2 py-0.5 rounded-none font-mono">
                4.9 / 5.0
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                420+ Verified Football Fans @kit.adda
              </span>
            </div>

            {/* Price Box */}
            <div className="mt-4 p-3.5 sm:p-4 rounded-none bg-[#0E131F] border border-[#1C2438] flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2.5 sm:gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-white font-jersey">
                    ₹{finalUnitPrice.toLocaleString("en-IN")}
                  </span>
                  {product.compare_at_price > product.price && (
                    <span className="text-xs sm:text-sm text-neutral-500 line-through">
                      ₹{product.compare_at_price.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="bg-[#1C2438] text-white border border-[#2B3854] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-none">
                      SAVE {discountPct}%
                    </span>
                  )}
                </div>
                <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-1">
                  Inclusive of all taxes • Free express shipping on ₹1499+
                </div>
              </div>

              {customization.addPatches && (
                <div className="text-right">
                  <span className="text-[9px] sm:text-[10px] text-[#DFB76C] font-bold block uppercase font-mono">
                    Patches Added
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    +₹{patchFee}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {product.description}
          </p>

          {/* Version / Fit Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-300 font-jersey">
                Fit Edition
              </label>
              <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                {selectedVersion === "Player Version" ? "Snug Slim Athletic Fit" : "Regular Stadium Fit"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {(["Fan Version", "Player Version"] as const).map((ver) => (
                <button
                  key={ver}
                  type="button"
                  onClick={() => setSelectedVersion(ver)}
                  className={`min-h-[46px] p-3 rounded-none border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-98 ${
                    selectedVersion === ver
                      ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C]"
                      : "bg-[#0E131F] border-[#1C2438] text-neutral-400 hover:text-white"
                  }`}
                >
                  {selectedVersion === ver && <Check className="w-3.5 h-3.5 text-[#DFB76C]" />}
                  <span>{ver}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-300 font-jersey">
                Select Size
              </label>
              <button
                type="button"
                onClick={() => setOpenAccordion("size-guide")}
                className="text-[11px] text-[#DFB76C] hover:underline flex items-center gap-1 font-semibold"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>View Size Guide</span>
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {(["S", "M", "L", "XL", "XXL"] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`min-h-[46px] py-3 rounded-none font-jersey text-base tracking-wider transition active:scale-95 ${
                    selectedSize === sz
                      ? "bg-[#C5A059] text-[#0A0D14] font-black"
                      : "bg-[#0E131F] border border-[#1C2438] text-neutral-300 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#DFB76C] mt-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-none bg-[#C5A059]" />
              <span>Only 4 units left in size {selectedSize} • High demand</span>
            </div>
          </div>

          {/* Customization Form Component */}
          <CustomizationForm
            basePrice={product.price}
            patchFee={patchFee}
            onCustomizationChange={setCustomization}
          />

          {/* Quantity & Desktop Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-2.5 sm:gap-3">
              {/* Stepper with enlarged 40px touch zone */}
              <div className="flex items-center bg-[#0E131F] border border-[#1C2438] rounded-none px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white font-bold text-lg active:scale-95"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-white text-sm font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white font-bold text-lg active:scale-95"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#0B132B] hover:bg-[#162035] text-white border border-[#1C2438] hover:border-[#C5A059]/50 font-bold uppercase text-xs sm:text-sm tracking-wider py-3.5 sm:py-4 rounded-none flex items-center justify-center gap-2 transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Bag</span>
              </button>
            </div>

            {/* Instant Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] font-black uppercase text-sm sm:text-base tracking-wider py-4 rounded-none flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-[#0A0D14]" />
              <span>Buy Now • Fast 1-Click Checkout</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#1C2438] text-center">
            <div className="p-2 sm:p-2.5 rounded-none bg-[#0E131F] border border-[#1C2438]">
              <Truck className="w-4 h-4 text-[#DFB76C] mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">Express Shipping</div>
              <div className="text-[9px] text-neutral-400">3-5 Days All-India</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-none bg-[#0E131F] border border-[#1C2438]">
              <RotateCcw className="w-4 h-4 text-[#DFB76C] mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">7 Days Exchange</div>
              <div className="text-[9px] text-neutral-400">Size guarantee</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-none bg-[#0E131F] border border-[#1C2438]">
              <ShieldCheck className="w-4 h-4 text-[#DFB76C] mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">Master Grade</div>
              <div className="text-[9px] text-neutral-400">Official embroidery</div>
            </div>
          </div>

          {/* Accordions */}
          <div className="space-y-3 pt-4 border-t border-[#1C2438]">
            {/* Accordion 1: Size Guide */}
            <div className="border border-[#1C2438] rounded-none overflow-hidden bg-[#0E131F]">
              <button
                type="button"
                onClick={() => toggleAccordion("size-guide")}
                className="w-full p-4 text-left font-black uppercase text-xs tracking-wider flex items-center justify-between text-white hover:text-[#DFB76C] transition"
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#DFB76C]" />
                  <span>Official Size Guide (Inches &amp; CM)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openAccordion === "size-guide" ? "rotate-180 text-[#DFB76C]" : "text-neutral-400"
                  }`}
                />
              </button>
              {openAccordion === "size-guide" && (
                <div className="p-4 pt-0 border-t border-[#1C2438] text-xs text-neutral-300">
                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left text-neutral-300 min-w-[320px]">
                      <thead>
                        <tr className="border-b border-[#1C2438] text-[10px] uppercase text-neutral-400 font-bold">
                          <th className="py-2">Size</th>
                          <th className="py-2">Chest (Inches)</th>
                          <th className="py-2">Length (Inches)</th>
                          <th className="py-2">Recommended Height</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1C2438] font-medium font-mono text-xs">
                        <tr>
                          <td className="py-2 font-bold text-white">S</td>
                          <td className="py-2">38&quot;</td>
                          <td className="py-2">27&quot;</td>
                          <td className="py-2">5&apos;4&quot; - 5&apos;7&quot;</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">M</td>
                          <td className="py-2">40&quot;</td>
                          <td className="py-2">28&quot;</td>
                          <td className="py-2">5&apos;7&quot; - 5&apos;10&quot;</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">L</td>
                          <td className="py-2">42&quot;</td>
                          <td className="py-2">29&quot;</td>
                          <td className="py-2">5&apos;10&quot; - 6&apos;1&quot;</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">XL</td>
                          <td className="py-2">44&quot;</td>
                          <td className="py-2">30&quot;</td>
                          <td className="py-2">6&apos;0&quot; - 6&apos;3&quot;</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">XXL</td>
                          <td className="py-2">46&quot;</td>
                          <td className="py-2">31&quot;</td>
                          <td className="py-2">6&apos;2&quot;+</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2.5 text-[11px] text-neutral-400">
                    *Tip: For Player Version kits, consider sizing up by 1 size if you prefer a looser stadium fit.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Shipping Policy */}
            <div className="border border-[#1C2438] rounded-none overflow-hidden bg-[#0E131F]">
              <button
                type="button"
                onClick={() => toggleAccordion("shipping-policy")}
                className="w-full p-4 text-left font-black uppercase text-xs tracking-wider flex items-center justify-between text-white hover:text-[#DFB76C] transition"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#DFB76C]" />
                  <span>Shipping &amp; Delivery Policy</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openAccordion === "shipping-policy" ? "rotate-180 text-[#DFB76C]" : "text-neutral-400"
                  }`}
                />
              </button>
              {openAccordion === "shipping-policy" && (
                <div className="p-4 pt-0 border-t border-[#1C2438] text-xs text-neutral-300 space-y-2">
                  <p>
                    • <strong className="text-white">Dispatch Time:</strong> Orders without customization are dispatched within 24-48 hours. Custom printed jerseys take an additional 24 hours for heat-press setting.
                  </p>
                  <p>
                    • <strong className="text-white">Delivery Partner:</strong> Shipped via Bluedart, Delhivery, or Xpressbees with live SMS &amp; WhatsApp tracking link sent directly to your phone.
                  </p>
                  <p>
                    • <strong className="text-white">Timeline:</strong> Metros (Mumbai, Delhi, Bangalore, Kolkata) arrive in 2-3 business days. Rest of India in 3-5 days.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3: Return Policy */}
            <div className="border border-[#1C2438] rounded-none overflow-hidden bg-[#0E131F]">
              <button
                type="button"
                onClick={() => toggleAccordion("return-policy")}
                className="w-full p-4 text-left font-black uppercase text-xs tracking-wider flex items-center justify-between text-white hover:text-[#DFB76C] transition"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#DFB76C]" />
                  <span>Return &amp; Replacement Policy</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openAccordion === "return-policy" ? "rotate-180 text-[#DFB76C]" : "text-neutral-400"
                  }`}
                />
              </button>
              {openAccordion === "return-policy" && (
                <div className="p-4 pt-0 border-t border-[#1C2438] text-xs text-neutral-300 space-y-2">
                  <p>
                    • <strong className="text-white">7-Day Replacement:</strong> We offer a 7-day hassle-free replacement for sizing issues on uncustomized kits in original unworn condition with tags.
                  </p>
                  <p>
                    • <strong className="text-white">Customized Printing:</strong> Shirts printed with personalized player name and number cannot be exchanged or returned unless there is a physical manufacturing defect.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Floating Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D14]/95 backdrop-blur-xl border-t border-[#1C2438] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_25px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-neutral-400 font-mono">
            Size: <span className="font-bold text-white">{selectedSize}</span> • {selectedVersion.split(" ")[0]}
          </div>
          <div className="text-lg font-black text-white font-jersey leading-tight">
            ₹{finalUnitPrice.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="h-11 px-3 bg-[#0B132B] hover:bg-[#162035] text-white border border-[#1C2438] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition"
            aria-label="Add to bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="h-11 px-5 bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Zap className="w-3.5 h-3.5 fill-[#0A0D14]" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
