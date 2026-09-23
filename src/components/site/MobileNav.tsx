"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph, YouTubeGlyph } from "@/components/site/SocialIcons";
import type { ISiteSettings } from "@/lib/models/SiteSettings";

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
  ctaText,
  ctaUrl,
  social,
}: {
  links: NavLink[];
  ctaText: string;
  ctaUrl: string;
  social?: ISiteSettings["social"];
}) {
  const [open, setOpen] = useState(false);
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
        <div className="absolute left-0 right-0 top-full bg-[var(--color-surface)] border-t border-black/5 shadow-lg">
          <nav className="flex flex-col p-5 gap-1">
            {links.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                target={link.openInNewTab ? "_blank" : undefined}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-md text-[var(--color-ink)] font-medium hover:bg-[var(--color-primary)]/5"
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href={ctaUrl} className="mt-3 justify-center" onClick={() => setOpen(false)}>
              {ctaText}
            </ButtonLink>

            <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
              <LanguageSelector />
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
