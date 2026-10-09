"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "up" | "none";
  blur?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = "",
  delayMs = 0,
  direction = "up",
  blur = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const transformStyle =
    direction === "up"
      ? isVisible
        ? "translateY(0)"
        : "translateY(12px)"
      : "none";

  const filterStyle = blur
    ? isVisible
      ? "blur(0px)"
      : "blur(6px)"
    : "none";

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: transformStyle,
        filter: filterStyle,
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: isVisible ? "auto" : "opacity, transform, filter",
      }}
      className={className}
    >
      {children}
    </div>
  );
};
