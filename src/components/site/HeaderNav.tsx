"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { CALCULATORS } from "@/lib/calculatorsData";
import type { NavCategory } from "@/components/site/Header";

export interface HeaderNavLink {
  label: string;
  url: string;
  openInNewTab: boolean;
}

interface MenuEntry {
  label: string;
  url: string;
}

export const CALCULATORS_URL = "/calculators";

/** Every calculator, in directory order, for the Calculators menu. */
export const CALCULATOR_MENU: MenuEntry[] = CALCULATORS.map((c) => ({ label: c.navLabel, url: c.href }));

export function isActivePath(pathname: string, url: string) {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(`${url}/`);
}

/** The CRS tool lives at /calculator; every other calculator under /calculators. */
export function isCalculatorPath(pathname: string) {
  return isActivePath(pathname, CALCULATORS_URL) || isActivePath(pathname, "/calculator");
}

const linkClass = (active: boolean) =>
  cn(
    "group relative whitespace-nowrap py-2 text-[0.92rem] font-medium transition-colors hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]",
    active ? "text-[var(--color-primary)]" : "text-[var(--color-ink)]"
  );

function Underline({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--color-accent)] transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100",
        active ? "scale-x-100" : "scale-x-0"
      )}
      aria-hidden="true"
    />
  );
}

/**
 * A top-level item with a dropdown. Hovering or focusing opens it. With a
 * landing page (Our Services) the label is a link and a chevron button
 * toggles the menu; without one (Calculators) the whole label is the button.
 */
function NavDropdown({
  item,
  active,
  entries,
  isCurrent,
  open,
  onOpenChange,
  labelIsToggle = false,
  footer,
  columns = 1,
}: {
  item: HeaderNavLink;
  active: boolean;
  entries: MenuEntry[];
  isCurrent: (url: string) => boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelIsToggle?: boolean;
  footer?: MenuEntry;
  columns?: 1 | 2;
}) {
  const pathname = usePathname();
  const dropdownId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) onOpenChange(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
        if (rootRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const onToggleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onOpenChange(true);
      requestAnimationFrame(() => rootRef.current?.querySelector<HTMLAnchorElement>("ul a")?.focus());
    }
  };

  const entryClass = (current: boolean) =>
    cn(
      "block px-4 py-2.5 text-[0.9rem] transition-colors",
      columns === 2 && "rounded-md",
      "hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-primary)] focus-visible:bg-[var(--color-accent)]/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-accent)]",
      current ? "bg-[var(--color-accent)]/10 font-medium text-[var(--color-primary)]" : "text-[var(--color-ink)]"
    );

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => {
        if (!rootRef.current?.contains(document.activeElement)) onOpenChange(false);
      }}
      onFocusCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onOpenChange(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onOpenChange(false);
      }}
    >
      {labelIsToggle ? (
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={dropdownId}
          // Hovering may already have opened it, so a click only ever opens; Escape or clicking away closes.
          onClick={() => onOpenChange(true)}
          onKeyDown={onToggleKeyDown}
          className={cn(linkClass(active), "flex items-center gap-1")}
        >
          {item.label}
          <ChevronDown className={cn("h-3.5 w-3.5 text-[var(--color-muted)] transition-transform", open && "rotate-180")} aria-hidden="true" />
          <Underline active={active} />
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <Link
            href={item.url}
            target={item.openInNewTab ? "_blank" : undefined}
            rel={item.openInNewTab ? "noopener noreferrer" : undefined}
            aria-current={pathname === item.url ? "page" : undefined}
            className={linkClass(active)}
            onClick={() => onOpenChange(false)}
          >
            {item.label}
            <Underline active={active} />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            aria-label={`Toggle ${item.label} menu`}
            aria-expanded={open}
            aria-controls={dropdownId}
            onClick={() => onOpenChange(!open)}
            onKeyDown={onToggleKeyDown}
            className="flex h-8 w-6 items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
          </button>
        </div>
      )}
      <div id={dropdownId} hidden={!open} className="absolute -left-4 top-full z-50 pt-2">
        <div
          className={cn(
            "rounded-[10px] border border-[var(--color-accent)]/20 bg-[var(--color-surface)] shadow-brand",
            columns === 2 ? "w-[480px]" : "w-[260px]"
          )}
        >
          <ul className={columns === 2 ? "grid grid-cols-2 gap-x-1 p-2" : "py-2"}>
            {entries.map((entry) => (
              <li key={entry.url}>
                <Link
                  href={entry.url}
                  aria-current={pathname === entry.url ? "page" : undefined}
                  onClick={() => onOpenChange(false)}
                  className={entryClass(isCurrent(entry.url))}
                >
                  {entry.label}
                </Link>
              </li>
            ))}
          </ul>
          {footer && (
            <Link
              href={footer.url}
              aria-current={pathname === footer.url ? "page" : undefined}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between gap-2 rounded-b-[10px] border-t border-[var(--color-accent)]/20 px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-accent)]/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              {footer.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function HeaderNav({ links, categories }: { links: HeaderNavLink[]; categories: NavCategory[] }) {
  const pathname = usePathname();
  // Which dropdown is open, and on which page it was opened — so navigating anywhere closes it.
  const [openMenu, setOpenMenu] = useState<{ url: string; on: string } | null>(null);

  const setMenuOpen = useCallback(
    (url: string, value: boolean) =>
      setOpenMenu((current) => (value ? { url, on: pathname } : current?.url === url ? null : current)),
    [pathname]
  );
  const setServicesOpen = useCallback((value: boolean) => setMenuOpen("/services", value), [setMenuOpen]);
  const setCalculatorsOpen = useCallback((value: boolean) => setMenuOpen(CALCULATORS_URL, value), [setMenuOpen]);
  const isOpen = (url: string) => openMenu?.url === url && openMenu.on === pathname;

  return (
    <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
      {links.map((item) => {
        if (item.url === "/services") {
          return (
            <NavDropdown
              key={item.url}
              item={item}
              active={isActivePath(pathname, item.url)}
              entries={categories.map((category) => ({ label: category.title, url: `/services/${category.slug}` }))}
              isCurrent={(url) => isActivePath(pathname, url)}
              open={isOpen(item.url)}
              onOpenChange={setServicesOpen}
            />
          );
        }

        if (item.url === CALCULATORS_URL) {
          return (
            <NavDropdown
              key={item.url}
              item={item}
              active={isCalculatorPath(pathname)}
              entries={CALCULATOR_MENU}
              isCurrent={(url) => pathname === url}
              open={isOpen(item.url)}
              onOpenChange={setCalculatorsOpen}
              labelIsToggle
              footer={{ label: "View all calculators", url: CALCULATORS_URL }}
              columns={2}
            />
          );
        }

        const active = isActivePath(pathname, item.url);
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
            <Underline active={active} />
          </Link>
        );
      })}
    </nav>
  );
}
