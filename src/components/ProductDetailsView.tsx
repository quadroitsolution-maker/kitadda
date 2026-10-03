"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface ProductDetailsViewProps {
  product: Product;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({ product }) => {
  const { addToCart, setIsCartOpen, setIsCheckoutOpen } = useCart();

  const [selectedImage, setSelectedImage] = useState(product.gallery[0] || product.image_url);
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L" | "XL" | "XXL">("L");
  const [selectedVersion, setSelectedVersion] = useState<"Fan Version" | "Player Version">(
    product.version_type || "Fan Version"
  );
  const [quantity, setQuantity] = useState(1);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-400 mb-6">
        <Link href="/" className="hover:text-[#DFB76C] transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/#latest-drops" className="hover:text-[#DFB76C] transition capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-[200px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Hero Image - Sharp Frame */}
          <div className="relative aspect-[3/4] w-full rounded-none overflow-hidden bg-[#0E131F] border border-[#1C2438]">
            <Image
              src={selectedImage}
              alt={product.title}
              fill
              priority
              className="object-cover object-center transition-all duration-300"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-[#0B132B] text-[#DFB76C] text-xs font-bold uppercase px-3 py-1 rounded-none border border-[#C5A059]/50 tracking-wider">
                {product.badge}
              </span>
            )}
            <div className="absolute bottom-4 right-4 bg-[#0B132B]/90 border border-[#1C2438] rounded-none px-3 py-1.5 text-xs font-bold text-neutral-300 flex items-center gap-2 backdrop-blur-sm">
              <div className="relative w-4 h-4 rounded-full overflow-hidden border border-[#C5A059]/40 shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Kit Adda Verified"
                  fill
                  sizes="16px"
                  className="object-cover object-center"
                />
              </div>
              <span>Kit Adda Master Grade</span>
            </div>
          </div>

          {/* Thumbnails row - Sharp */}
          {product.gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-24 rounded-none overflow-hidden shrink-0 border-2 transition ${
                    selectedImage === img
                      ? "border-[#C5A059]"
                      : "border-[#1C2438] hover:border-neutral-600"
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

        {/* Right Column: Details, Customizer & Buy Action (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="text-[#DFB76C] text-xs font-bold uppercase tracking-wider mb-2">
              {product.team} • {product.season} Drop
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight font-jersey">
              {product.title}
            </h1>

            {/* Minimal Social Proof Rating (No star icon spam) */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-black text-[#DFB76C] bg-[#0B132B] border border-[#C5A059]/40 px-2 py-0.5 rounded-none font-mono">
                4.9 / 5.0
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                420+ Verified Football Fans @kit.adda
              </span>
            </div>

            {/* Price Box with Dynamic Calculation - Sharp Minimal */}
            <div className="mt-4 p-4 rounded-none bg-[#0E131F] border border-[#1C2438] flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white font-jersey">
                    ₹{finalUnitPrice.toLocaleString("en-IN")}
                  </span>
                  {product.compare_at_price > product.price && (
                    <span className="text-sm text-neutral-500 line-through">
                      ₹{product.compare_at_price.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="bg-[#1C2438] text-white border border-[#2B3854] text-xs font-bold px-2 py-0.5 rounded-none">
                      SAVE {discountPct}%
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Inclusive of all taxes • Free express shipping on ₹1499+
                </div>
              </div>

              {customization.addPatches && (
                <div className="text-right">
                  <span className="text-[10px] text-[#DFB76C] font-bold block uppercase">
                    Includes Patches
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    +₹{patchFee} added
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
              <label className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Fit Edition
              </label>
              <span className="text-[11px] text-neutral-400">
                {selectedVersion === "Player Version" ? "Snug Slim Athletic Fit" : "Regular Stadium Fit"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["Fan Version", "Player Version"] as const).map((ver) => (
                <button
                  key={ver}
                  type="button"
                  onClick={() => setSelectedVersion(ver)}
                  className={`p-3 rounded-none border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                    selectedVersion === ver
                      ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C]"
                      : "bg-[#0E131F] border-[#1C2438] text-neutral-400 hover:text-white hover:border-neutral-700"
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
              <label className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Select Size
              </label>
              <button
                type="button"
                onClick={() => setOpenAccordion("size-guide")}
                className="text-[11px] text-[#DFB76C] hover:underline flex items-center gap-1 font-semibold"
              >
                <Ruler className="w-3 h-3" />
                <span>View Size Guide</span>
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {(["S", "M", "L", "XL", "XXL"] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`py-3 rounded-none font-jersey text-base tracking-wider transition ${
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

          {/* Quantity & CTA Buttons - Sharp Minimal */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center bg-[#0E131F] border border-[#1C2438] rounded-none px-3 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 text-neutral-400 hover:text-white font-bold text-lg"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-white text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 text-neutral-400 hover:text-white font-bold text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#0B132B] hover:bg-[#162035] text-white border border-[#1C2438] hover:border-[#C5A059]/50 font-bold uppercase text-xs sm:text-sm tracking-wider py-4 rounded-none flex items-center justify-center gap-2 transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Cart</span>
              </button>
            </div>

            {/* Instant Buy Now Button - Champagne Gold Accent */}
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
            <div className="p-2.5 rounded-none bg-[#0E131F] border border-[#1C2438]">
              <Truck className="w-4 h-4 text-[#DFB76C] mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">Express Shipping</div>
              <div className="text-[9px] text-neutral-400">3-5 Days All-India</div>
            </div>
            <div className="p-2.5 rounded-none bg-[#0E131F] border border-[#1C2438]">
              <RotateCcw className="w-4 h-4 text-[#DFB76C] mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">7 Days Exchange</div>
              <div className="text-[9px] text-neutral-400">Size guarantee</div>
            </div>
            <div className="p-2.5 rounded-none bg-[#0E131F] border border-[#1C2438]">
              <ShieldCheck className="w-4 h-4 text-[#DFB76C] mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">Master Grade</div>
              <div className="text-[9px] text-neutral-400">Official embroidery</div>
            </div>
          </div>

          {/* Accordions for Size Guide, Shipping & Returns */}
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-neutral-300">
                      <thead>
                        <tr className="border-b border-[#1C2438] text-[10px] uppercase text-neutral-400 font-bold">
                          <th className="py-2">Size</th>
                          <th className="py-2">Chest (Inches)</th>
                          <th className="py-2">Length (Inches)</th>
                          <th className="py-2">Recommended Height</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1C2438] font-medium">
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
                  <p>
                    • <strong className="text-white">Defect Guarantee:</strong> If your kit arrives damaged or with printing errors, reach out to our WhatsApp team (@kit.adda) within 48 hours for immediate replacement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
