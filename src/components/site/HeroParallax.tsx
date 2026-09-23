"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Subtle scroll polish for the hero's visual: as the page scrolls, the
 * background drifts a few pixels slower than the page (a light parallax).
 * Respects prefers-reduced-motion and no-ops gracefully without JS.
 */
export function HeroParallax({ children, className }: { children?: React.ReactNode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = wrap!.getBoundingClientRect();
        // Only animate while the hero is at least partly on screen.
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const offset = Math.max(-40, Math.min(40, rect.top * -0.08));
          wrap!.style.transform = `translateY(${offset}px)`;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={wrapRef} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
