"use client";

import { MotionConfig } from "framer-motion";

/**
 * Wraps the whole public site so every Framer Motion animation anywhere
 * (buttons, cards, hero, nav) automatically respects the visitor's OS-level
 * "reduce motion" preference — one place to get this right instead of
 * threading a reducedMotion check through every animated component.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
