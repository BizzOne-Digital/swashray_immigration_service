"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import {
  CALCULATOR_MENU,
  CALCULATORS_URL,
  isActivePath,
  isCalculatorPath,
  type HeaderNavLink,
} from "@/components/site/HeaderNav";
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph, YouTubeGlyph } from "@/components/site/SocialIcons";
import type { ISiteSettings } from "@/lib/models/SiteSettings";
import type { NavCategory } from "@/components/site/Header";
import { cn } from "@/lib/cn";

const SOCIAL_ICONS = {
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  linkedin: LinkedInGlyph,
  x: XGlyph,
  youtube: YouTubeGlyph,
} as const;

/**
 * Small-screen menu: a full-width panel under the header with every top-level
 * link stacked, the service categories always listed (indented) under
 * "Our Services", the calculators behind an expandable "Calculators" item,
 * then the booking CTA, contact details, language switcher, and social links.
 */
export function MobileNav({
  links,
  categories,
  ctaText,
  ctaUrl,
  social,
  phone,
  email,
}: {
  links: HeaderNavLink[];
  categories: NavCategory[];
  ctaText: string;
  ctaUrl: string;
  social?: ISiteSettings["social"];
  phone?: string;
  email?: string;
}) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // The panel remembers which page it was opened on, so navigating anywhere
  // closes it automatically.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean | ((prev: boolean) => boolean)) =>
    setOpenOn((typeof value === "function" ? value(open) : value) ? pathname : null);
  // Until toggled, the calculators list starts expanded only on a calculator page.
  const [calculatorsToggled, setCalculatorsToggled] = useState<boolean | null>(null);
  const calculatorsOpen = calculatorsToggled ?? isCalculatorPath(pathname);
  const socialEntries = (Object.keys(SOCIAL_ICONS) as Array<keyof typeof SOCIAL_ICONS>).filter(
    (key) => social?.[key]
  );

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenOn(null);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpenOn(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const linkClass = (active: boolean) =>
    cn(
      "block px-3 py-3 font-medium transition-colors hover:text-[var(--color-primary)]",
      active ? "text-[var(--color-primary)]" : "text-[var(--color-ink)]"
    );
  const subLinkClass = (active: boolean) =>
    cn(
      "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-primary)]",
      active ? "bg-[var(--color-accent)]/10 font-medium text-[var(--color-primary)]" : "text-[var(--color-muted)]"
    );

  return (
    <div ref={rootRef} className="xl:hidden">
      <button
        type="button"
        ref={toggleRef}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent)]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain border-t border-[var(--color-accent)]/20 bg-[var(--color-surface)] shadow-brand"
        >
          <nav aria-label="Main" className="mx-auto flex max-w-2xl flex-col px-5 py-4 sm:px-8">
            <ul className="divide-y divide-black/[0.06]">
              {links.map((link) => {
                const active = isActivePath(pathname, link.url);
                if (link.url === CALCULATORS_URL) {
                  return (
                    <li key={link.url}>
                      <button
                        type="button"
                        aria-expanded={calculatorsOpen}
                        aria-controls="mobile-menu-calculators"
                        onClick={() => setCalculatorsToggled(!calculatorsOpen)}
                        className={cn(linkClass(isCalculatorPath(pathname)), "flex w-full items-center justify-between text-left")}
                      >
                        {link.label}
                        <ChevronDown
                          className={cn("h-4 w-4 text-[var(--color-muted)] transition-transform", calculatorsOpen && "rotate-180")}
                          aria-hidden="true"
                        />
                      </button>
                      {calculatorsOpen && (
                        <ul
                          id="mobile-menu-calculators"
                          className="mb-2 ml-3 flex flex-col gap-0.5 border-l-2 border-[var(--color-accent)]/40 pl-3"
                        >
                          {[...CALCULATOR_MENU, { label: "View all calculators", url: CALCULATORS_URL }].map((entry) => (
                            <li key={entry.url}>
                              <Link
                                href={entry.url}
                                aria-current={pathname === entry.url ? "page" : undefined}
                                onClick={() => setOpen(false)}
                                className={subLinkClass(pathname === entry.url)}
                              >
                                {entry.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }
                if (link.url !== "/services") {
                  return (
                    <li key={link.url}>
                      <Link
                        href={link.url}
                        target={link.openInNewTab ? "_blank" : undefined}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={linkClass(active)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={link.url} className="pb-2">
                    <Link
                      href={link.url}
                      aria-current={pathname === link.url ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={linkClass(active)}
                    >
                      {link.label}
                    </Link>
                    <ul className="ml-3 flex flex-col gap-0.5 border-l-2 border-[var(--color-accent)]/40 pl-3">
                      {categories.map((c) => {
                        const href = `/services/${c.slug}`;
                        const current = isActivePath(pathname, href);
                        return (
                          <li key={c.slug}>
                            <Link
                              href={href}
                              aria-current={current ? "page" : undefined}
                              onClick={() => setOpen(false)}
                              className={subLinkClass(current)}
                            >
                              {c.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>

            <ButtonLink href={ctaUrl} variant="secondary" className="mt-4 justify-center" onClick={() => setOpen(false)}>
              {ctaText}
            </ButtonLink>

            {(phone || email) && (
              <ul className="mt-5 space-y-2.5 text-sm">
                {phone && (
                  <li>
                    <a
                      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                      className="flex items-center gap-2.5 text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2.5 break-all text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            )}

            <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between">
              <LanguageSelector align="left" />
              {socialEntries.length > 0 && (
                <div className="flex items-center gap-3">
                  {socialEntries.map((key) => {
                    const Icon = SOCIAL_ICONS[key];
                    return (
                      <a
                        key={key}
                        href={social?.[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={key}
                        className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
