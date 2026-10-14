import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";

/**
 * Compact text card for a single service — used on the /services hub, where
 * every service in every category is listed at once (the photo-led
 * ServicePathCard is kept for the individual category pages).
 */
export function ServiceLinkCard({
  href,
  icon,
  title,
  shortDescription,
  programs,
}: {
  href: string;
  icon: string;
  title: string;
  shortDescription: string;
  /** Titles of the service's sub-programs/streams, if it has any. */
  programs?: string[];
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50 hover:shadow-brand-sm"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15">
        <Icon name={icon} className="h-[18px] w-[18px] text-[var(--color-primary)]" />
      </span>
      <h3 className="mt-4 font-heading text-lg font-semibold leading-snug text-[var(--color-primary)]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{shortDescription}</p>
      {programs && programs.length > 0 && (
        <p className="mt-2.5 text-xs leading-relaxed text-[var(--color-muted)]">
          <span className="font-semibold text-[var(--color-ink)]">Includes: </span>
          {programs.join(" · ")}
        </p>
      )}
      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] transition-all group-hover:gap-2.5">
        Learn more <ArrowRight className="h-3.5 w-3.5 text-[var(--color-accent)]" />
      </span>
    </Link>
  );
}
