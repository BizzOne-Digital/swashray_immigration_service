import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/**
 * Photo card for a single service on the /services hub.
 */
export function ServiceLinkCard({
  href,
  image,
  title,
  shortDescription,
  programs,
}: {
  href: string;
  image: string;
  title: string;
  shortDescription: string;
  /** Titles of the service's sub-programs/streams, if it has any. */
  programs?: string[];
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50 hover:shadow-brand-sm"
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-heading text-lg font-semibold leading-snug text-[var(--color-primary)]">{title}</h3>
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
      </div>
    </Link>
  );
}
