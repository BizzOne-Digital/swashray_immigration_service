"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

// A curated set of languages likely useful for this audience. Google
// Translate itself supports 100+ — add more codes here any time. Each entry
// shows a representative country flag plus its name written in English (so
// every row is legible regardless of which language is currently active),
// matching the closed pill's compact "EN"-style code + flag.
const LANGUAGES: { code: string; label: string; name: string; flag: string }[] = [
  { code: "en", label: "EN", name: "English", flag: "🇨🇦" },
  { code: "fr", label: "FR", name: "French", flag: "🇫🇷" },
  { code: "es", label: "ES", name: "Spanish", flag: "🇪🇸" },
  { code: "hi", label: "HI", name: "Hindi", flag: "🇮🇳" },
  { code: "pa", label: "PA", name: "Punjabi", flag: "🇮🇳" },
  { code: "gu", label: "GU", name: "Gujarati", flag: "🇮🇳" },
  { code: "ur", label: "UR", name: "Urdu", flag: "🇵🇰" },
  { code: "zh-CN", label: "中文", name: "Chinese", flag: "🇨🇳" },
  { code: "tl", label: "TL", name: "Tagalog", flag: "🇵🇭" },
  { code: "ar", label: "AR", name: "Arabic", flag: "🇦🇪" },
  { code: "fa", label: "FA", name: "Persian", flag: "🇮🇷" },
  { code: "pt", label: "PT", name: "Portuguese", flag: "🇵🇹" },
  { code: "vi", label: "VI", name: "Vietnamese", flag: "🇻🇳" },
  { code: "ko", label: "KO", name: "Korean", flag: "🇰🇷" },
];

declare global {
  interface Window {
    google?: { translate?: { TranslateElement?: new (options: object, id: string) => void } };
    googleTranslateElementInit?: () => void;
  }
}

// The Google Website Translator widget only needs ONE hidden container /
// TranslateElement instance on the whole page — but this dropdown can be
// rendered in more than one place at once (desktop top bar + mobile menu).
// A module-level flag makes the first mounted instance the "owner" that
// injects the script and creates the widget container; every other
// instance just renders its own UI and drives the shared `.goog-te-combo`
// element the owner creates.
let widgetOwnerClaimed = false;
// Whether Google's widget has finished initializing, plus the set of
// currently-mounted instances waiting to hear about it. Only the "owner"
// instance injects the script and defines the global init callback, but
// every instance (owner or not) needs its own `ready` state flipped once
// that happens — otherwise a later-mounted, non-owner instance (e.g. the
// mobile menu's copy) would stay permanently disabled.
let translateReady = false;
const readyListeners = new Set<() => void>();
function notifyTranslateReady() {
  translateReady = true;
  readyListeners.forEach((fn) => fn());
}

/**
 * Drives the actual language switch: either resets Google's cookie (back to
 * English) or hands the code to the widget's own combo box, falling back to
 * setting the cookie directly if the widget hasn't finished loading yet.
 * Kept as a plain top-level function (not inline in the component) since it
 * intentionally mutates globals (cookie, location) as a side effect.
 */
function applyLanguageCookie(code: string) {
  if (code === "en") {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
    return;
  }
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo) {
    combo.value = code;
    combo.dispatchEvent(new Event("change"));
  } else {
    // Widget not ready yet — set the cookie Google reads on load and reload once.
    document.cookie = `googtrans=/en/${code}; path=/;`;
    window.location.reload();
  }
}

/**
 * A custom-styled dropdown driven by Google's free Website Translator
 * widget. Loads Google's script client-side only; if it fails to load (no
 * network, blocked, etc.) the selector simply has no effect — the rest of
 * the site is completely unaffected either way.
 */
export function LanguageSelector({ light = false, align = "right" }: { light?: boolean; align?: "left" | "right" }) {
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState("en");
  const [open, setOpen] = useState(false);
  const reactId = useId();
  const buttonId = `language-selector-${reactId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  // Always false on the server AND on the initial client render, so
  // hydration matches exactly. Ownership is claimed inside the effect below
  // (which only ever runs client-side, after hydration), and the resulting
  // setIsOwner(true) triggers a normal post-hydration re-render for the
  // instance that wins the claim — never a hydration mismatch.
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Restore a previously selected language (Google stores it in this cookie).
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match) setCurrent(match[1]);

    // Every instance — owner or not — needs to know when the widget becomes
    // ready. If it already is (a later-mounted instance, e.g. opening the
    // mobile menu after the page settled), reflect that immediately;
    // otherwise queue this instance to be notified once it happens.
    const onReady = () => setReady(true);
    if (translateReady) {
      onReady();
    } else {
      readyListeners.add(onReady);
    }

    if (!widgetOwnerClaimed) {
      widgetOwnerClaimed = true;
      setIsOwner(true);

      window.googleTranslateElementInit = () => {
        try {
          if (window.google?.translate?.TranslateElement) {
            new window.google.translate.TranslateElement(
              { pageLanguage: "en", autoDisplay: false },
              "google_translate_element"
            );
            notifyTranslateReady();
          }
        } catch {
          // Translation widget unavailable — dropdown stays inert, site unaffected.
        }
      };

      const existing = document.getElementById("google-translate-script");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      readyListeners.delete(onReady);
    };

    // Runs once on mount only — isOwner is set exclusively from inside this
    // same effect, so it must not be a dependency (that would just re-run
    // this effect immediately after the setIsOwner(true) above, for no
    // benefit).
  }, []);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleChange(code: string) {
    setCurrent(code);
    setOpen(false);
    applyLanguageCookie(code);
  }

  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  return (
    <div ref={rootRef} className="relative">
      {/* Required container for Google's widget — only one instance renders it. */}
      {isOwner && <div id="google_translate_element" className="hidden" aria-hidden="true" />}

      <button
        id={buttonId}
        type="button"
        disabled={!ready && current === "en"}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select website language"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border pl-2.5 pr-2 py-1.5 transition-colors",
          light ? "border-white/25 hover:bg-white/5" : "border-black/10 hover:bg-black/[0.03]"
        )}
      >
        <span aria-hidden="true" className="text-sm leading-none notranslate">
          {currentLang.flag}
        </span>
        <span className={cn("notranslate text-xs font-semibold", light ? "text-white" : "text-[var(--color-ink)]")}>
          {currentLang.label}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180", light ? "text-white/70" : "text-[var(--color-muted)]")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={buttonId}
          className={cn(
            "notranslate absolute top-full z-50 mt-2 w-36 max-h-72 overflow-y-scroll overscroll-contain rounded-xl border border-black/[0.06] bg-white py-2 shadow-brand-sm scrollbar-brand",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === current}
              aria-label={l.name}
              title={l.name}
              onClick={() => handleChange(l.code)}
              className={cn(
                "flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.04]",
                l.code === current ? "bg-black/[0.03]" : ""
              )}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                {l.flag}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold tracking-wide",
                  l.code === current ? "text-[var(--color-primary)]" : "text-slate-500"
                )}
              >
                {l.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
