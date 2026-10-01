"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  Flame, 
  MessageCircle, 
  Heart 
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
    <footer className="bg-[#070709] border-t border-neutral-800/80 text-neutral-400 text-xs mt-20">
      {/* Community Banner */}
      <div className="border-b border-neutral-800/60 py-10 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-white font-jersey">
                JOIN THE KIT ADDA CULT
              </h3>
              <p className="text-xs text-neutral-400 max-w-md">
                Over 25,000+ football freaks across India wear our kits. Tag us on Instagram <strong className="text-emerald-400">@kit.adda</strong> to get featured in our matchday feed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-extrabold uppercase px-5 py-2.5 rounded-xl transition shadow-lg shadow-pink-500/20 text-xs"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Follow @kit.adda</span>
            </a>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366]/30 text-[#25D366] font-bold uppercase px-4 py-2.5 rounded-xl transition text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="text-xl font-black uppercase text-white font-jersey tracking-tight mb-3">
            KIT<span className="text-emerald-500">ADDA</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            India's ultimate football jersey hangout. Curating Master Grade official fan & player version kits, iconic retro holy grails, and football culture merch.
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
              <Link href="/#latest-drops" className="hover:text-emerald-400 transition">
                Latest 2024/25 Season Drops
              </Link>
            </li>
            <li>
              <Link href="/#retro-vault" className="hover:text-emerald-400 transition">
                Retro Vault (CR7, Messi, Zidane)
              </Link>
            </li>
            <li>
              <Link href="/#category-international" className="hover:text-emerald-400 transition">
                International Tournament Kits
              </Link>
            </li>
            <li>
              <Link href="/#category-jackets" className="hover:text-emerald-400 transition">
                Tracksuits & Anthem Jackets
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-black uppercase text-white tracking-wider mb-4">
            Customer Care
          </div>
          <ul className="space-y-2.5">
            <li>
              <Link href="/#size-guide" className="hover:text-emerald-400 transition">
                Detailed Size Chart & Fit Guide
              </Link>
            </li>
            <li>
              <Link href="/#shipping-policy" className="hover:text-emerald-400 transition">
                Track Your Bluedart/Delhivery Order
              </Link>
            </li>
            <li>
              <Link href="/#return-policy" className="hover:text-emerald-400 transition">
                7 Days Replacement Policy
              </Link>
            </li>
            <li>
              <a href="mailto:support@kitadda.in" className="hover:text-emerald-400 transition">
                Help & Email Support (support@kitadda.in)
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-black uppercase text-white tracking-wider mb-4">
            100% Safe & Secure Checkout
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed mb-3">
            Protected with 256-bit bank grade encryption. We support UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Netbanking & Cash On Delivery.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {["Razorpay", "UPI", "GPay", "PhonePe", "Paytm", "COD"].map((pay) => (
              <span
                key={pay}
                className="bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-300 px-2 py-1 rounded"
              >
                {pay}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright */}
      <div className="border-t border-neutral-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Kit Adda. All rights reserved. Crafted with passion for the football community.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
