"use client";

import { useEffect, useId, useState } from "react";
import { Languages } from "lucide-react";

// A curated set of languages likely useful for this audience. Google
// Translate itself supports 100+ — add more codes here any time.
const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "hi", label: "हिन्दी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "ur", label: "اردو" },
  { code: "zh-CN", label: "中文(简体)" },
  { code: "tl", label: "Tagalog" },
  { code: "ar", label: "العربية" },
  { code: "fa", label: "فارسی" },
  { code: "pt", label: "Português" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ko", label: "한국어" },
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
// instance just renders its own <select> UI and drives the shared
// `.goog-te-combo` element the owner creates.
let widgetOwnerClaimed = false;

/**
 * A custom-styled dropdown driven by Google's free Website Translator
 * widget. Loads Google's script client-side only; if it fails to load (no
 * network, blocked, etc.) the selector simply has no effect — the rest of
 * the site is completely unaffected either way.
 */
export function LanguageSelector({ light = false }: { light?: boolean }) {
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState("en");
  const reactId = useId();
  const selectId = `language-selector-${reactId}`;
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

    if (widgetOwnerClaimed) return;
    widgetOwnerClaimed = true;
    setIsOwner(true);

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", autoDisplay: false },
            "google_translate_element"
          );
          setReady(true);
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
      script.onerror = () => setReady(false);
      document.body.appendChild(script);
    }

    // Runs once on mount only — isOwner is set exclusively from inside this
    // same effect, so it must not be a dependency (that would just re-run
    // this effect immediately after the setIsOwner(true) above, for no
    // benefit).
  }, []);

  function handleChange(code: string) {
    setCurrent(code);
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

  return (
    <div className="relative">
      {/* Required container for Google's widget — only one instance renders it. */}
      {isOwner && <div id="google_translate_element" className="hidden" aria-hidden="true" />}
      <label className="sr-only" htmlFor={selectId}>
        Select website language
      </label>
      <div className={`flex items-center gap-1.5 text-xs ${light ? "text-white/70" : "text-[var(--color-muted)]"}`}>
        <Languages className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <select
          id={selectId}
          value={current}
          onChange={(e) => handleChange(e.target.value)}
          disabled={!ready && current === "en"}
          className={`notranslate bg-transparent border-none text-xs font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] rounded cursor-pointer ${
            light ? "text-white/80" : "text-[var(--color-muted)]"
          }`}
          aria-label="Select website language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="text-slate-900">
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
