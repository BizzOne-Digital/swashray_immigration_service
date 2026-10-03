import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";

export function ServicePathCard({
  href,
  icon,
  title,
  shortDescription,
  suitableFor,
  keyConsiderations,
  index = 0,
}: {
  href: string;
  icon: string;
  title: string;
  shortDescription: string;
  suitableFor?: string;
  keyConsiderations?: string[];
  index?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-accent)]/40 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)]/15 mb-4 transition-colors group-hover:bg-[var(--color-accent)]/25">
        <Icon name={icon} className="h-5 w-5 text-[var(--color-primary)]" />
      </span>
      <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">{shortDescription}</p>

      {suitableFor && (
        <p className="mt-3 text-xs text-[var(--color-muted)] leading-relaxed">
          <span className="font-semibold text-[var(--color-ink)]">Suitable for: </span>
          {suitableFor}
        </p>
      )}

      {keyConsiderations && keyConsiderations.length > 0 && (
        <ul className="mt-3 space-y-1">
          {keyConsiderations.slice(0, 3).map((k) => (
            <li key={k} className="flex items-start gap-1.5 text-xs text-[var(--color-muted)]">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
              {k}
            </li>
          ))}
        </ul>
      )}

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] group-hover:gap-2.5 transition-all">
        Explore
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
