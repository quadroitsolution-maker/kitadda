"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { CustomizationForm } from "@/components/CustomizationForm";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  ShoppingBag,
  Zap,
  Check,
  Ruler,
  Share2,
  Heart,
  Flame,
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
  const finalSubtotal = finalUnitPrice * quantity;

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
        <Link href="/" className="hover:text-emerald-400 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/#latest-drops" className="hover:text-emerald-400 transition capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-[200px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#121215] border border-neutral-800">
            <Image
              src={selectedImage}
              alt={product.title}
              fill
              priority
              className="object-cover object-center transition-all duration-300"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-emerald-500 text-black text-xs font-black uppercase px-3 py-1 rounded shadow tracking-wider">
                {product.badge}
              </span>
            )}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md border border-neutral-700/60 rounded-full px-3 py-1 text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Authentic Quality</span>
            </div>
          </div>

          {/* Thumbnails row */}
          {product.gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    selectedImage === img
                      ? "border-emerald-500 scale-95"
                      : "border-neutral-800 hover:border-neutral-600"
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

        {/* Right Column: Details, Customizer & Buy Action (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5" />
              <span>{product.team} • {product.season} Drop</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight font-jersey">
              {product.title}
            </h1>

            {/* Social Proof Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-300">
                4.9/5 (420+ Verified Fans @kit.adda)
              </span>
            </div>

            {/* Price Box with Dynamic Calculation */}
            <div className="mt-4 p-4 rounded-xl bg-[#121215] border border-neutral-800 flex items-center justify-between">
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
                    <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black px-2 py-0.5 rounded">
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
                  <span className="text-[10px] text-emerald-400 font-bold block uppercase">
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
                  className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                    selectedVersion === ver
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10"
                      : "bg-[#121215] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  {selectedVersion === ver && <Check className="w-3.5 h-3.5" />}
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
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
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
                  className={`py-3 rounded-xl font-jersey text-base tracking-wider transition ${
                    selectedSize === sz
                      ? "bg-white text-black font-black shadow-lg"
                      : "bg-[#121215] border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Only 4 units left in size {selectedSize} • High demand</span>
            </div>
          </div>

          {/* Customization Form Component */}
          <CustomizationForm
            basePrice={product.price}
            patchFee={patchFee}
            onCustomizationChange={setCustomization}
          />

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center bg-[#121215] border border-neutral-800 rounded-xl px-3 py-1">
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
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-black uppercase text-xs sm:text-sm tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Cart</span>
              </button>
            </div>

            {/* Instant Buy Now Button (Breeze 1-Click Checkout) */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-sm sm:text-base tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition transform active:scale-95 shadow-xl shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Buy Now • Fast 1-Click Checkout</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-800/80 text-center">
            <div className="p-2.5 rounded-lg bg-[#121215] border border-neutral-800">
              <Truck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">Express Shipping</div>
              <div className="text-[9px] text-neutral-400">3-5 Days All-India</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#121215] border border-neutral-800">
              <RotateCcw className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">7 Days Exchange</div>
              <div className="text-[9px] text-neutral-400">Size guarantee</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#121215] border border-neutral-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white uppercase">Master Grade</div>
              <div className="text-[9px] text-neutral-400">Official embroidery</div>
            </div>
          </div>

          {/* Accordions for Size Guide, Shipping & Returns */}
          <div className="space-y-3 pt-4 border-t border-neutral-800/80">
            {/* Accordion 1: Size Guide */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#121215]">
              <button
                type="button"
                onClick={() => toggleAccordion("size-guide")}
                className="w-full p-4 text-left font-black uppercase text-xs tracking-wider flex items-center justify-between text-white hover:text-emerald-400 transition"
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-400" />
                  <span>Official Size Guide (Inches & CM)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openAccordion === "size-guide" ? "rotate-180 text-emerald-400" : "text-neutral-400"
                  }`}
                />
              </button>
              {openAccordion === "size-guide" && (
                <div className="p-4 pt-0 border-t border-neutral-800/60 text-xs text-neutral-300">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-neutral-300">
                      <thead>
                        <tr className="border-b border-neutral-800 text-[10px] uppercase text-neutral-400 font-bold">
                          <th className="py-2">Size</th>
                          <th className="py-2">Chest (Inches)</th>
                          <th className="py-2">Length (Inches)</th>
                          <th className="py-2">Recommended Height</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 font-medium">
                        <tr>
                          <td className="py-2 font-bold text-white">S</td>
                          <td className="py-2">38"</td>
                          <td className="py-2">27"</td>
                          <td className="py-2">5'4" - 5'7"</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">M</td>
                          <td className="py-2">40"</td>
                          <td className="py-2">28"</td>
                          <td className="py-2">5'7" - 5'10"</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">L</td>
                          <td className="py-2">42"</td>
                          <td className="py-2">29"</td>
                          <td className="py-2">5'10" - 6'1"</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">XL</td>
                          <td className="py-2">44"</td>
                          <td className="py-2">30"</td>
                          <td className="py-2">6'0" - 6'3"</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">XXL</td>
                          <td className="py-2">46"</td>
                          <td className="py-2">31"</td>
                          <td className="py-2">6'2"+</td>
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
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#121215]">
              <button
                type="button"
                onClick={() => toggleAccordion("shipping-policy")}
                className="w-full p-4 text-left font-black uppercase text-xs tracking-wider flex items-center justify-between text-white hover:text-emerald-400 transition"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Shipping & Delivery Policy</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openAccordion === "shipping-policy" ? "rotate-180 text-emerald-400" : "text-neutral-400"
                  }`}
                />
              </button>
              {openAccordion === "shipping-policy" && (
                <div className="p-4 pt-0 border-t border-neutral-800/60 text-xs text-neutral-300 space-y-2">
                  <p>
                    • <strong className="text-white">Dispatch Time:</strong> Orders without customization are dispatched within 24-48 hours. Custom printed jerseys take an additional 24 hours for heat-press setting.
                  </p>
                  <p>
                    • <strong className="text-white">Delivery Partner:</strong> Shipped via Bluedart, Delhivery, or Xpressbees with live SMS & WhatsApp tracking link sent directly to your phone.
                  </p>
                  <p>
                    • <strong className="text-white">Timeline:</strong> Metros (Mumbai, Delhi, Bangalore, Kolkata) arrive in 2-3 business days. Rest of India in 3-5 days.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3: Return & Replacement Policy */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#121215]">
              <button
                type="button"
                onClick={() => toggleAccordion("return-policy")}
                className="w-full p-4 text-left font-black uppercase text-xs tracking-wider flex items-center justify-between text-white hover:text-emerald-400 transition"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span>Return & Replacement Policy</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openAccordion === "return-policy" ? "rotate-180 text-emerald-400" : "text-neutral-400"
                  }`}
                />
              </button>
              {openAccordion === "return-policy" && (
                <div className="p-4 pt-0 border-t border-neutral-800/60 text-xs text-neutral-300 space-y-2">
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
