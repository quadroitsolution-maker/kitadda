"use client";

import React, { useEffect, useState, useRef } from "react";

export const FootballCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetPosRef = useRef({ x: -100, y: -100 });
  const rotationRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Only activate on devices with fine pointer (mouse / trackpad)
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let lastX = -100;
    let isInsideShopping = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetPosRef.current = { x: e.clientX, y: e.clientY };

      // Calculate delta movement to dynamically spin the ball as you move
      const deltaX = e.clientX - lastX;
      lastX = e.clientX;
      rotationRef.current += deltaX * 1.5;

      // Check if cursor is over a shopping section or element marked with cursor-football
      const target = e.target as HTMLElement | null;
      const shoppingSection = target?.closest(".cursor-football");

      if (shoppingSection) {
        if (!isInsideShopping) {
          isInsideShopping = true;
          setIsVisible(true);
        }

        // Check if hovering over clickable elements
        const isClickable = Boolean(
          target?.closest("a") ||
          target?.closest("button") ||
          target?.closest(".group") ||
          target?.closest("[role='button']")
        );
        setIsHoveringLink(isClickable);
      } else {
        if (isInsideShopping) {
          isInsideShopping = false;
          setIsVisible(false);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);

    // Smooth 60/120fps animation loop
    const updatePosition = () => {
      // Smooth linear interpolation (lerp) for snappy yet fluid feel
      posRef.current.x += (targetPosRef.current.x - posRef.current.x) * 0.75;
      posRef.current.y += (targetPosRef.current.y - posRef.current.y) * 0.75;

      // Continual subtle auto-spin
      rotationRef.current = (rotationRef.current + 1.2) % 360;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0px) translate(-50%, -50%)`;
        const innerBall = cursorRef.current.querySelector<HTMLElement>(".ball-spinner");
        if (innerBall) {
          innerBall.style.transform = `rotate(${rotationRef.current}deg)`;
        }
      }

      rafIdRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    rafIdRef.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ willChange: "transform" }}
    >
      <div
        className={`transition-all duration-150 relative ${
          isClicking
            ? "scale-75"
            : isHoveringLink
            ? "scale-125 drop-shadow-[0_0_8px_rgba(223,183,108,0.5)]"
            : "scale-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Rotating Football Vector */}
        <div className="ball-spinner w-7 h-7 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 28 28"
            className="w-full h-full"
            fill="none"
          >
            {/* White Ball Body with Dark Edge Outline */}
            <circle cx="14" cy="14" r="12.5" fill="#FFFFFF" stroke="#0A0D14" strokeWidth="2" />

            {/* Center Classic Pentagon */}
            <polygon
              points="14,9.5 17.8,12.3 16.3,17 11.7,17 10.2,12.3"
              fill="#0A0D14"
              stroke="#0A0D14"
              strokeLinejoin="round"
            />

            {/* Seam Lines Radiating Out */}
            <line x1="14" y1="9.5" x2="14" y2="1.5" stroke="#0A0D14" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="17.8" y1="12.3" x2="25.5" y2="9.5" stroke="#0A0D14" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="16.3" y1="17" x2="21.5" y2="24.5" stroke="#0A0D14" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="11.7" y1="17" x2="6.5" y2="24.5" stroke="#0A0D14" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="10.2" y1="12.3" x2="2.5" y2="9.5" stroke="#0A0D14" strokeWidth="1.6" strokeLinecap="round" />

            {/* Outer Pentagon Patches for 3D sphere depth */}
            <polygon points="11,1.5 14,1.5 17,1.5 15.5,4 12.5,4" fill="#0A0D14" />
            <polygon points="25.5,9.5 26.5,12.5 24,15 22.5,12" fill="#0A0D14" />
            <polygon points="21.5,24.5 18,26.5 15.5,24.5 18,21.5" fill="#0A0D14" />
            <polygon points="6.5,24.5 10,26.5 12.5,24.5 10,21.5" fill="#0A0D14" />
            <polygon points="2.5,9.5 1.5,12.5 4,15 5.5,12" fill="#0A0D14" />
          </svg>
        </div>

        {/* Golden ring pulse effect when hovering interactive buttons/cards */}
        {isHoveringLink && (
          <div className="absolute -inset-1 rounded-full border border-[#DFB76C]/60 animate-ping opacity-30 pointer-events-none" />
        )}
      </div>
    </div>
  );
};
