"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavCategory } from "@/components/site/Header";

export interface HeaderNavLink {
  label: string;
  url: string;
  openInNewTab: boolean;
}

export const RESOURCES_LINK = { label: "Resources & Tools", url: "/calculators" } as const;

export function isActivePath(pathname: string, url: string) {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function HeaderNav({ links, categories }: { links: HeaderNavLink[]; categories: NavCategory[] }) {
  const pathname = usePathname();
  const dropdownId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !dropdownRef.current?.contains(event.target)) setOpenOn(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenOn(null);
        if (dropdownRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const linkClass = (active: boolean) => cn(
    "group relative whitespace-nowrap py-2 text-[0.92rem] font-medium transition-colors hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]",
    active ? "text-[var(--color-primary)]" : "text-[var(--color-ink)]"
  );

  return (
    <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
      {links.map((item) => {
        const active = isActivePath(pathname, item.url) ||
          (item.url === "/services" && (isActivePath(pathname, RESOURCES_LINK.url) || isActivePath(pathname, "/calculator")));
        const underline = (
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--color-accent)] transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100",
              active ? "scale-x-100" : "scale-x-0"
            )}
            aria-hidden="true"
          />
        );

        if (item.url !== "/services") {
          return (
            <Link
              key={item.url}
              href={item.url}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              aria-current={pathname === item.url ? "page" : undefined}
              className={linkClass(active)}
            >
              {item.label}
              {underline}
            </Link>
          );
        }

        return (
          <div
            key={item.url}
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setOpenOn(pathname)}
            onMouseLeave={() => {
              if (!dropdownRef.current?.contains(document.activeElement)) setOpenOn(null);
            }}
            onFocusCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setOpenOn(pathname);
            }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setOpenOn(null);
            }}
          >
            <div className="flex items-center gap-1">
              <Link
                href={item.url}
                target={item.openInNewTab ? "_blank" : undefined}
                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                aria-current={pathname === item.url ? "page" : undefined}
                className={linkClass(active)}
                onClick={() => setOpenOn(null)}
              >
                {item.label}
                {underline}
              </Link>
              <button
                ref={toggleRef}
                type="button"
                aria-label="Toggle service categories"
                aria-expanded={open}
                aria-controls={dropdownId}
                onClick={() => setOpenOn(open ? null : pathname)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setOpenOn(pathname);
                    requestAnimationFrame(() => dropdownRef.current?.querySelector<HTMLAnchorElement>("ul a")?.focus());
                  }
                }}
                className="flex h-8 w-6 items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
              </button>
            </div>
            <div id={dropdownId} hidden={!open} className="absolute -left-4 top-full z-50 pt-2">
              <ul className="w-[260px] rounded-[10px] border border-[var(--color-accent)]/20 bg-[var(--color-surface)] py-2 shadow-brand">
                {[
                  ...categories.map((category) => ({ label: category.title, url: `/services/${category.slug}` })),
                  RESOURCES_LINK,
                ].map((entry) => {
                  const current = isActivePath(pathname, entry.url);
                  return (
                    <li key={entry.url}>
                      <Link
                        href={entry.url}
                        aria-current={pathname === entry.url ? "page" : undefined}
                        onClick={() => setOpenOn(null)}
                        className={cn(
                          "block px-4 py-2.5 text-[0.9rem] transition-colors hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-primary)] focus-visible:bg-[var(--color-accent)]/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                          current ? "bg-[var(--color-accent)]/10 font-medium text-[var(--color-primary)]" : "text-[var(--color-ink)]"
                        )}
                      >
                        {entry.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
