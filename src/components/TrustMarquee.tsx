"use client";

import React from "react";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MessageCircle,
} from "lucide-react";

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: "MATCH-SPEC QUALITY",
    description: "Authentic crest embroidery and breathable dri-fit weave.",
  },
  {
    icon: CreditCard,
    title: "100% SECURE PREPAID",
    description: "Instant 1-click UPI, GPay, Cards & 256-bit SSL encryption.",
  },
  {
    icon: Truck,
    title: "EXPRESS DISPATCH",
    description: "Delhi NCR 2-3d • Pan-India 3-6d. Free on ₹999+.",
  },
  {
    icon: MessageCircle,
    title: "DIRECT WHATSAPP DESK",
    description: "Real-time sizing advice & one-on-one live order tracking.",
  },
];

export const TrustMarquee: React.FC = () => {
  return (
    <section className="py-10 sm:py-14 bg-[#FFFFFF] border-y border-[#E2E6EE] overflow-hidden relative select-none">
      {/* Infinite Scrolling Track */}
      <div className="flex animate-trust-loop hover:[animation-play-state:paused]">
        {/* Render 3 consecutive sets to guarantee 100% seamless infinite looping across any screen resolution */}
        {[...TRUST_FEATURES, ...TRUST_FEATURES, ...TRUST_FEATURES].map((feat, index) => {
          const Icon = feat.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 mx-2.5 sm:mx-3 bg-[#F7F8FA] border border-[#E2E6EE] hover:border-[#0A0D14] transition-all rounded-none min-w-[280px] sm:min-w-[340px] shrink-0"
            >
              {/* Dark emblem icon badge */}
              <div className="p-2.5 sm:p-3 bg-[#0A0D14] text-[#DFB76C] shrink-0 shadow-sm">
                <Icon className="w-5 h-5" />
              </div>

              {/* Text content */}
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase text-[#0A0D14] font-jersey tracking-tight">
                  {feat.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-neutral-600 mt-1 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
