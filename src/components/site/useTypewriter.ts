"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Types `text` out one character at a time, holds briefly, erases it, and
 * retypes — looping continuously for as long as `active` stays true. Resets
 * cleanly whenever `text` changes (e.g. the hero moves to a new slide).
 *
 * Fully client-only (started from an effect, never during render) so there
 * is no SSR/hydration mismatch. Uses a single chained setTimeout (not
 * setInterval) with a `cancelled` flag checked at every step, so a quick
 * slide change can never leave an old loop still ticking and corrupting a
 * new slide's text — the exact class of bug a setInterval-based version hit
 * earlier in this project.
 *
 * When `enabled` is false (prefers-reduced-motion, or not yet mounted) the
 * full text is returned immediately with no animation and no loop.
 */
export function useTypewriter(
  text: string,
  {
    active = true,
    enabled = true,
    loop = true,
    speed = 26,
    eraseSpeed = 14,
    holdMs = 1800,
    holdEmptyMs = 500,
  }: {
    active?: boolean;
    enabled?: boolean;
    loop?: boolean;
    speed?: number;
    eraseSpeed?: number;
    holdMs?: number;
    holdEmptyMs?: number;
  } = {}
) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!active) return;

    if (!enabled) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    let cancelled = false;

    function typeFrom(i: number) {
      if (cancelled) return;
      setDisplayed(text.slice(0, i));
      if (i < text.length) {
        timeoutRef.current = setTimeout(() => typeFrom(i + 1), speed);
      } else {
        setDone(true);
        if (loop) {
          timeoutRef.current = setTimeout(() => eraseFrom(text.length), holdMs);
        }
      }
    }

    function eraseFrom(i: number) {
      if (cancelled) return;
      setDisplayed(text.slice(0, i));
      if (i > 0) {
        timeoutRef.current = setTimeout(() => eraseFrom(i - 1), eraseSpeed);
      } else {
        setDone(false);
        timeoutRef.current = setTimeout(() => typeFrom(0), holdEmptyMs);
      }
    }

    setDone(false);
    typeFrom(0);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, active, enabled, loop, speed, eraseSpeed, holdMs, holdEmptyMs]);

  return { displayed, done };
}
