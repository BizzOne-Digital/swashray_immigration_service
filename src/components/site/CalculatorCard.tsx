import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";
import type { CalculatorEntry } from "@/lib/calculatorsData";

export function CalculatorCard({ entry, index = 0 }: { entry: CalculatorEntry; index?: number }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15 ring-1 ring-[var(--color-accent)]/30">
          <Icon name={entry.icon} className="h-5.5 w-5.5 text-[var(--color-primary)]" />
        </span>
        {entry.internal ? (
          <span className="rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Our Tool
          </span>
        ) : (
          <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Official Source
          </span>
        )}
      </div>

      <h3 className="mt-5 font-heading text-lg font-semibold text-[var(--color-ink)] leading-snug">
        {entry.title}
      </h3>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
        {entry.authority}
      </p>
      <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{entry.description}</p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] group-hover:gap-2.5 transition-all">
        {entry.internal ? "Open Calculator" : "Visit Official Page"}
        {entry.internal ? (
          <ArrowRight className="h-4 w-4" />
        ) : (
          <ExternalLink className="h-3.5 w-3.5" />
        )}
      </span>
    </>
  );

  const className =
    "group relative block h-full rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-lg hover:border-[var(--color-accent)]/50 animate-fade-in-up";
  const style = { animationDelay: `${Math.min(index, 8) * 60}ms` };

  if (entry.internal) {
    return (
      <Link href={entry.href} className={className} style={style}>
        {body}
      </Link>
    );
  }

  return (
    <a href={entry.href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {body}
    </a>
  );
}
