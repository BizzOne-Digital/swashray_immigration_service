import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";
import type { CategoryEntry } from "@/lib/servicesData";

export function CategoryCard({ category, index = 0 }: { category: CategoryEntry; index?: number }) {
  return (
    <Link
      href={`/services/${category.slug}`}
      className="group relative flex flex-col rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-accent)]/40 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/15 mb-5 transition-colors group-hover:bg-[var(--color-accent)]/25">
        <Icon name={category.icon} className="h-5.5 w-5.5 text-[var(--color-primary)]" />
      </span>
      <h3 className="font-heading text-xl font-semibold text-[var(--color-primary)]">{category.title}</h3>
      <p className="mt-2.5 text-sm text-[var(--color-muted)] leading-relaxed flex-1">{category.shortDescription}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] group-hover:gap-2.5 transition-all">
        Explore {category.title}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
