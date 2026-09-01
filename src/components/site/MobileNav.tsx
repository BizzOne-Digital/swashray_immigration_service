"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export interface NavLink {
  label: string;
  url: string;
  openInNewTab: boolean;
}

export function MobileNav({ links, ctaText, ctaUrl }: { links: NavLink[]; ctaText: string; ctaUrl: string }) {
  const [open, setOpen] = useState(false);

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
          </nav>
        </div>
      )}
    </div>
  );
}
