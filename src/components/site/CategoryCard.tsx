import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";
import type { CategoryEntry } from "@/lib/servicesData";

export function CategoryCard({ category, index = 0 }: { category: CategoryEntry; index?: number }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/services/${category.slug}`}
      className="group relative block h-[420px] sm:h-[450px] rounded-[var(--radius-card)] overflow-hidden shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-lg hover:ring-[var(--color-accent)]/50 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
          <Icon name={category.icon} className="h-16 w-16 text-white/15" />
        </div>
      )}

      {/* Dark gradient scrim so the number/title/copy stay readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
        <span className="block font-heading text-4xl sm:text-5xl font-semibold text-[var(--color-accent)] leading-none">
          {number}
        </span>
        <h3 className="mt-3 font-heading text-xl sm:text-2xl font-semibold text-white">{category.title}</h3>
        <p className="mt-2.5 text-sm text-white/80 leading-relaxed line-clamp-3">{category.shortDescription}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] group-hover:gap-2.5 transition-all">
          Explore {category.title} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
