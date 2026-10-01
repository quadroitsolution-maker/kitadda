"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, Shield, ArrowRight } from "lucide-react";

interface Slide {
  id: number;
  tagline: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  badge: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tagline: "INSTAGRAM-NATIVE FOOTBALL VAULT",
    headline: "Welcome to the Adda. India's Ultimate Football Hub.",
    description: "Curated Master Grade player & fan editions for the true football faithful. High-density embroidery, match-spec fabric, and official typography.",
    ctaText: "Shop Latest Drops",
    ctaLink: "#latest-drops",
    secondaryCtaText: "Customize Your Kit",
    secondaryCtaLink: "/products/rm-home-2425",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=85",
    badge: "SEASON 2024/25 ARRIVALS"
  },
  {
    id: 2,
    tagline: "DROP 04 / MATCHDAY SERIES",
    headline: "New Season. New Kits. Wear Your Passion.",
    description: "From Santiago Bernabéu to the Emirates and San Siro. Gear up with authentic details, moisture-wicking weave, and personalized name & number prints.",
    ctaText: "Explore Club Kits",
    ctaLink: "#category-club",
    secondaryCtaText: "View Lookbook",
    secondaryCtaLink: "https://instagram.com",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85",
    badge: "100% PLAYER GRADE"
  },
  {
    id: 3,
    tagline: "ARCHIVE NOSTALGIA",
    headline: "Timeless Retro Classics. Relive Football Folklore.",
    description: "Cristiano in Moscow 2008. Kaká in Athens 2007. Zidane in 1998. Grab limited-run classic shirts before they enter the history books forever.",
    ctaText: "Enter Retro Vault",
    ctaLink: "#retro-vault",
    secondaryCtaText: "International Kits",
    secondaryCtaLink: "#category-international",
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1920&q=85",
    badge: "LIMITED RETRO DROP"
  }
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
    <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[700px] overflow-hidden bg-black select-none">
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Dark Vignette Overlays */}
            <div className="absolute inset-0">
              <Image
                src={slide.imageUrl}
                alt={slide.headline}
                fill
                priority={idx === 0}
                className="object-cover object-center scale-105 transform motion-safe:animate-pulse-slow"
              />
              {/* Multilayer Gradient Overlay for intense Full Time Store contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-black/50" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            </div>

            {/* Slide Content Container */}
            <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 z-20">
              <div className="max-w-2xl space-y-4 sm:space-y-6">
                {/* Badge Tag */}
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs sm:text-sm font-black tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slide.badge}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.08] font-jersey">
                  {slide.headline}
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base lg:text-lg text-neutral-300 font-normal leading-relaxed max-w-xl">
                  {slide.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs sm:text-sm tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 group"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {slide.secondaryCtaText && (
                    <Link
                      href={slide.secondaryCtaLink || "#"}
                      className="inline-flex items-center gap-2 bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700/80 font-bold uppercase text-xs sm:text-sm tracking-wider px-5 sm:px-7 py-3.5 sm:py-4 rounded-xl transition backdrop-blur-sm"
                    >
                      <span>{slide.secondaryCtaText}</span>
                    </Link>
                  )}
                </div>

                {/* Trust mini-badge */}
                <div className="flex items-center gap-6 pt-3 text-neutral-400 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Official Match Details</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Free Name & Number Customization</span>
                  </div>
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 border border-neutral-800 text-white/80 hover:text-white hover:bg-black/80 hover:scale-110 transition backdrop-blur-md hidden sm:flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 border border-neutral-800 text-white/80 hover:text-white hover:bg-black/80 hover:scale-110 transition backdrop-blur-md hidden sm:flex items-center justify-center"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicator Dots / Bars */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide
                ? "w-8 h-2 bg-emerald-500"
                : "w-2 h-2 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
