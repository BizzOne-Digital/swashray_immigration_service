import { ScrollReveal } from "@/components/site/ScrollReveal";
import type { FaqEntry } from "@/lib/servicesData";

export function FaqAccordion({ heading, items }: { heading?: string; items: FaqEntry[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ScrollReveal>
      {heading && (
        <>
          <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)]">{heading}</h2>
          <span className="heading-rule" aria-hidden="true" />
        </>
      )}
      <div className={`${heading ? "mt-6" : ""} space-y-4`}>
        {items.map((item, i) => (
          <details key={i} className="group rounded-[var(--radius-card)] border border-black/[0.06] p-5">
            <summary className="cursor-pointer font-medium text-[var(--color-primary)] list-none flex items-center justify-between gap-4">
              <span>{item.question}</span>
              <span className="shrink-0 text-[var(--color-muted)] group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </ScrollReveal>
  );
}
