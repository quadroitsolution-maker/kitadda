"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export const CookieBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("kitadda_cookie_consent");
      if (!consent) {
        // Show after a short delay for smooth user experience
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors in private mode
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("kitadda_cookie_consent", "accepted");
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("kitadda_cookie_consent", "essential_only");
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#0E131F]/95 backdrop-blur-md border border-[#C5A059]/40 p-4 sm:p-5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 text-neutral-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-none bg-[#0B132B] border border-[#1C2438] flex items-center justify-center text-[#DFB76C] shrink-0 mt-0.5">
          <Cookie className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Cookies &amp; Data Privacy
            </h4>
            <button
              onClick={handleEssentialOnly}
              className="text-neutral-400 hover:text-white transition p-1"
              aria-label="Close cookie banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-300">
            We use essential cookies to keep your jersey cart active and secure, and minimal analytics to improve your shopping experience. By continuing to browse, you agree to our{" "}
            <Link
              href="/privacy-policy"
              className="text-[#DFB76C] underline hover:text-[#C5A059]"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms-and-conditions"
              className="text-[#DFB76C] underline hover:text-[#C5A059]"
            >
              Terms
            </Link>.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              className="flex-1 bg-[#0B132B] hover:bg-[#162035] text-[#DFB76C] border border-[#C5A059]/50 font-bold text-[11px] uppercase py-1.5 px-3 rounded-none transition active:scale-95 text-center"
            >
              Accept All
            </button>
            <button
              onClick={handleEssentialOnly}
              className="bg-[#0A0D14] hover:bg-[#1C2438] text-neutral-400 hover:text-white border border-[#1C2438] font-medium text-[11px] uppercase py-1.5 px-3 rounded-none transition active:scale-95 text-center"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
