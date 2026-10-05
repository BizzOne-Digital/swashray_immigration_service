import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";
import { resolveRelated } from "@/lib/servicesCms";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export async function RelatedServices({ relatedSlugs }: { relatedSlugs: string[] }) {
  const related = await resolveRelated(relatedSlugs);
  if (related.length === 0) return null;

  return (
    <ScrollReveal>
      <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)]">Related Services</h2>
      <span className="heading-rule" aria-hidden="true" />
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map(({ category, service }) => (
          <Link
            key={`${category.slug}/${service.slug}`}
            href={`/services/${category.slug}/${service.slug}`}
            className="group flex items-start gap-3 rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-brand-sm hover:border-[var(--color-accent)]/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15">
              <Icon name={service.icon} className="h-4 w-4 text-[var(--color-primary)]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[var(--color-primary)]">{service.title}</span>
              <span className="mt-1 flex items-center gap-1 text-xs text-[var(--color-muted)] group-hover:gap-1.5 transition-all">
                {category.title} <ArrowRight className="h-3 w-3" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </ScrollReveal>
  );
}
