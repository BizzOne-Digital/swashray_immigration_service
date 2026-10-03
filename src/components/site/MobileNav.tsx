"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/IconMap";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph, YouTubeGlyph } from "@/components/site/SocialIcons";
import type { ISiteSettings } from "@/lib/models/SiteSettings";
import type { NavService } from "@/components/site/Header";
import { CATEGORIES } from "@/lib/servicesData";
import { cn } from "@/lib/cn";

export interface NavLink {
  label: string;
  url: string;
  openInNewTab: boolean;
}

const SOCIAL_ICONS = {
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  linkedin: LinkedInGlyph,
  x: XGlyph,
  youtube: YouTubeGlyph,
} as const;

export function MobileNav({
  links,
  services,
  ctaText,
  ctaUrl,
  social,
}: {
  links: NavLink[];
  services?: NavService[];
  ctaText: string;
  ctaUrl: string;
  social?: ISiteSettings["social"];
}) {
  const [open, setOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const socialEntries = (Object.keys(SOCIAL_ICONS) as Array<keyof typeof SOCIAL_ICONS>).filter(
    (key) => social?.[key]
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="p-2 -mr-2 text-[var(--color-primary)]"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full bg-[var(--color-surface)] border-t border-black/5 shadow-brand">
          <nav className="flex flex-col p-5 gap-1">
            {links.map((link) => {
              const isPrograms = link.url === "/services";
              if (!isPrograms) {
                return (
                  <Link
                    key={link.url}
                    href={link.url}
                    target={link.openInNewTab ? "_blank" : undefined}
                    onClick={() => setOpen(false)}
                    className="px-3 py-3 rounded-md text-[var(--color-ink)] font-medium hover:bg-[var(--color-primary)]/5"
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <div key={link.url}>
                  <button
                    type="button"
                    onClick={() => setProgramsOpen((v) => !v)}
                    aria-expanded={programsOpen}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-md text-[var(--color-ink)] font-medium hover:bg-[var(--color-primary)]/5"
                  >
                    {link.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", programsOpen && "rotate-180")} />
                  </button>
                  {programsOpen && (
                    <div className="ml-2 mb-1 flex flex-col gap-0.5 border-l-2 border-[var(--color-primary)]/10 pl-3">
                      {CATEGORIES.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/services/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                        >
                          <Icon name={c.icon} className="h-4 w-4 text-[var(--color-primary)]/70 shrink-0" />
                          {c.title}
                        </Link>
                      ))}
                      <Link
                        href="/services"
                        onClick={() => setOpen(false)}
                        className="px-2 py-2 text-sm font-medium text-[var(--color-primary)]"
                      >
                        View All Services
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
            <ButtonLink href={ctaUrl} className="mt-3 justify-center" onClick={() => setOpen(false)}>
              {ctaText}
            </ButtonLink>

            <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
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
