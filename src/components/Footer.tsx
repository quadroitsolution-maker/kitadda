"use client";

import React from "react";
import Link from "next/link";
import { 
  Flame, 
  MessageCircle
} from "lucide-react";

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#07090E] border-t border-[#1C2438] text-neutral-400 text-xs mt-20">
      {/* Community Banner - Minimal Navy & Deep Charcoal */}
      <div className="border-b border-[#1C2438] py-10 bg-[#0E131F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-none bg-[#0B132B] border border-[#1C2438] flex items-center justify-center text-[#DFB76C] shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-white font-jersey">
                JOIN THE KIT ADDA CULT
              </h3>
              <p className="text-xs text-neutral-400 max-w-md">
                Over 25,000+ football freaks across India wear our kits. Tag us on Instagram <strong className="text-[#DFB76C]">@kit.adda</strong> to get featured in our matchday feed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0B132B] hover:bg-[#162035] text-[#DFB76C] border border-[#C5A059]/40 font-bold uppercase px-5 py-2.5 rounded-none transition text-xs"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Follow @kit.adda</span>
            </a>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0E131F] border border-[#1C2438] hover:border-[#DFB76C]/60 text-white font-bold uppercase px-4 py-2.5 rounded-none transition text-xs"
            >
              <MessageCircle className="w-4 h-4 text-[#DFB76C]" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="text-xl font-black uppercase text-white font-jersey tracking-tight mb-3">
            KIT<span className="text-[#C5A059]">ADDA</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            India&apos;s ultimate football jersey hangout. Curating Master Grade official fan &amp; player version kits, iconic retro holy grails, and football culture merch.
          </p>
          <div className="text-[11px] text-neutral-500">
            Based in India 🇮🇳 • Shipping Pan-India
          </div>
        </div>

        <div>
          <div className="text-xs font-black uppercase text-white tracking-wider mb-4">
            Collections
          </div>
          <ul className="space-y-2.5">
            <li>
              <Link href="/#latest-drops" className="hover:text-[#DFB76C] transition">
                Latest 2024/25 Season Drops
              </Link>
            </li>
            <li>
              <Link href="/#retro-vault" className="hover:text-[#DFB76C] transition">
                Retro Vault (CR7, Messi, Zidane)
              </Link>
            </li>
            <li>
              <Link href="/#category-international" className="hover:text-[#DFB76C] transition">
                International Tournament Kits
              </Link>
            </li>
            <li>
              <Link href="/#category-jackets" className="hover:text-[#DFB76C] transition">
                Anthem Jackets &amp; Tracksuits
              </Link>
            </li>
            <li>
              <Link href="/#clearance" className="hover:text-[#DFB76C] transition">
                End of Season Sale
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-black uppercase text-white tracking-wider mb-4">
            Help &amp; Support
          </div>
          <ul className="space-y-2.5">
            <li>
              <Link href="/#size-guide" className="hover:text-[#DFB76C] transition">
                Size Guide &amp; Fit Chart
              </Link>
            </li>
            <li>
              <Link href="/#shipping-policy" className="hover:text-[#DFB76C] transition">
                Shipping &amp; Delivery Timeline
              </Link>
            </li>
            <li>
              <Link href="/#return-policy" className="hover:text-[#DFB76C] transition">
                7-Day Replacement Policy
              </Link>
            </li>
            <li>
              <Link href="https://wa.me/919999999999" target="_blank" className="hover:text-[#DFB76C] transition">
                Track Order on WhatsApp
              </Link>
            </li>
            <li>
              <Link href="mailto:support@kitadda.com" className="hover:text-[#DFB76C] transition">
                Contact: support@kitadda.com
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-black uppercase text-white tracking-wider mb-4">
            Payment &amp; Trust
          </div>
          <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
            100% secure checkout via Razorpay. We accept UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, Net Banking &amp; Cash On Delivery.
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold text-[#DFB76C]">
            <span className="bg-[#0B132B] border border-[#1C2438] px-2 py-1 rounded-none">UPI / GPay</span>
            <span className="bg-[#0B132B] border border-[#1C2438] px-2 py-1 rounded-none">Cards</span>
            <span className="bg-[#0B132B] border border-[#1C2438] px-2 py-1 rounded-none">Net Banking</span>
            <span className="bg-[#0B132B] border border-[#1C2438] px-2 py-1 rounded-none">Cash on Delivery</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1C2438] py-6 text-center text-neutral-500 text-[11px]">
        © {new Date().getFullYear()} Kit Adda (@kit.adda). All rights reserved. Curated for football culture across India.
      </div>
    </footer>
  );
};
