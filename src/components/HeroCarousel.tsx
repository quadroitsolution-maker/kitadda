"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface Slide {
  id: number;
  badge: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    badge: "2024/25 SEASON",
    headline: "Current Season Kits",
    description: "Player & Fan Version master grade drops.",
    ctaText: "Shop Now",
    ctaLink: "#latest-drops",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=85",
  },
  {
    id: 2,
    badge: "MATCH GEAR",
    headline: "Anti-Slip Grip Socks",
    description: "High-traction silicone lock-in.",
    ctaText: "Shop Accessories",
    ctaLink: "#latest-drops",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85",
  },
  {
    id: 3,
    badge: "INTERNATIONAL",
    headline: "World Cup Editions",
    description: "Official national team jerseys.",
    ctaText: "View Collection",
    ctaLink: "#latest-drops",
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1920&q=85",
  },
];

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[440px] sm:h-[500px] lg:h-[560px] overflow-hidden bg-[#0A0D14] select-none border-b border-[#1C2438]">
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Clean Minimal Overlays */}
            <div className="absolute inset-0">
              <Image
                src={slide.imageUrl}
                alt={slide.headline}
                fill
                priority={idx === 0}
                className="object-cover object-center scale-105"
              />
              <div className="absolute inset-0 bg-[#0A0D14]/75" />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Slide Content Container - Minimal Text */}
            <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 z-20">
              <div className="max-w-xl space-y-3 sm:space-y-4">
                {/* Minimal Tag */}
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-none border border-[#C5A059]/40 bg-[#0B132B]/90 text-[#DFB76C] text-[11px] font-bold tracking-widest uppercase">
                  <span>{slide.badge}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none font-jersey">
                  {slide.headline}
                </h1>

                {/* Short Minimal Description */}
                <p className="text-xs sm:text-sm text-neutral-300 font-normal">
                  {slide.description}
                </p>

                {/* Minimal CTA Button */}
                <div className="pt-2">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] font-black uppercase text-xs tracking-wider px-6 py-3 rounded-none transition-all group"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Manual Slide Navigation Controls */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-none bg-[#0B132B]/85 border border-[#1C2438] text-white hover:border-[#C5A059] transition hidden sm:flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-none bg-[#0B132B]/85 border border-[#1C2438] text-white hover:border-[#C5A059] transition hidden sm:flex items-center justify-center"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicator Bars */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-none h-1 ${
              idx === currentSlide
                ? "w-8 bg-[#C5A059]"
                : "w-4 bg-white/20 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
