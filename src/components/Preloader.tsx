"use client";

import React, { useEffect, useState } from "react";

export const Preloader: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const hasShown = sessionStorage.getItem("kitadda_shutter_seen");
      if (hasShown) {
        setIsComplete(true);
        return;
      }
    } catch {
      // Ignore sessionStorage exceptions
    }

    // Phase 1: Hold stacked wordmark briefly
    const holdTimer = setTimeout(() => {
      setIsAnimatingOut(true);
      try {
        sessionStorage.setItem("kitadda_shutter_seen", "true");
      } catch {
        // Ignore
      }
    }, 850);

    // Phase 2: Shutter finish & unmount
    const finishTimer = setTimeout(() => {
      setIsComplete(true);
    }, 1600);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  if (!mounted || isComplete) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Shutter Half carrying "KIT" */}
      <div
        className={`w-full h-[50vh] bg-[#0A0D14] border-b border-[#1C2438] flex flex-col justify-end items-center pb-1 sm:pb-2 transition-transform duration-750 ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
          isAnimatingOut ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <span className="text-6xl sm:text-8xl md:text-9xl font-black uppercase text-white font-jersey tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-3 duration-500">
          KIT
        </span>
      </div>

      {/* Bottom Shutter Half carrying "ADDA" */}
      <div
        className={`w-full h-[50vh] bg-[#0A0D14] border-t border-[#1C2438] flex flex-col justify-start items-center pt-1 sm:pt-2 transition-transform duration-750 ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
          isAnimatingOut ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <span className="text-6xl sm:text-8xl md:text-9xl font-black uppercase text-[#C5A059] font-jersey tracking-tighter leading-none animate-in fade-in slide-in-from-top-3 duration-500">
          ADDA
        </span>
      </div>
    </div>
  );
};
