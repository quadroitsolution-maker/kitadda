"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { siteConfig } from "@/config/site";

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
      }, 3000);
    }
  };

  return (
    <footer className="bg-[#0A0D14] border-t border-[#1C2438] text-neutral-300 text-sm mt-16 sm:mt-24 pb-28 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          {/* Column 1: Policies (Left) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#DFB76C]">
              POLICIES
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="hover:text-white transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-and-returns"
                  className="hover:text-white transition-colors"
                >
                  Shipping &amp; Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href={siteConfig.whatsappUrl("Hi Kit Adda team, I want to track my order.")}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Track on WhatsApp
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Collections & Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#DFB76C]">
              VAULT
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <Link
                  href="/products?category=player-version"
                  className="hover:text-white transition-colors"
                >
                  Player Version Kits
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=fan-version"
                  className="hover:text-white transition-colors"
                >
                  Fan Version Kits
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=accessories"
                  className="hover:text-white transition-colors"
                >
                  Anti-Slip Grip Socks
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-white transition-colors text-neutral-500"
                >
                  Store Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Brand & Newsletter Signup (Right) */}
          <div className="md:col-span-6 space-y-6">
            {/* Brand Mark */}
            <div>
              <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-jersey">
                KIT<span className="text-[#C5A059]">ADDA</span>
              </div>
            </div>

            {/* Newsletter Title */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white font-jersey">
                STAY IN THE LOOP WITH OUR WEEKLY DROPS
              </h3>

              {/* Minimal Newsletter Input */}
              <form onSubmit={handleSubscribe} className="relative max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121622] border border-[#1C2438] focus:border-[#C5A059] rounded-none px-4 py-3.5 pr-14 text-sm text-white placeholder-neutral-500 focus:outline-none transition"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to weekly newsletter"
                  className="absolute right-2 top-2 bottom-2 w-9 h-9 rounded-full bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] flex items-center justify-center transition active:scale-95"
                >
                  {subscribed ? (
                    <Check className="w-4 h-4 text-[#0A0D14]" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#0A0D14]" />
                  )}
                </button>
              </form>
              {subscribed && (
                <p className="text-xs text-[#DFB76C] font-semibold">
                  ✓ You&apos;re on the VIP drops list.
                </p>
              )}
            </div>

            {/* Social Link */}
            <div className="pt-2">
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                aria-label="Follow Kit Adda on Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-14 pt-8 border-t border-[#1C2438] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Kit Adda. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Prepaid Orders Only</span>
            <span>•</span>
            <span>Pan-India Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
