import { CheckCircle2, FileCheck2, AlertCircle, type LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/site/ScrollReveal";

const ICONS: Record<string, LucideIcon> = {
  check: CheckCircle2,
  document: FileCheck2,
  note: AlertCircle,
};

export function ChecklistSection({
  heading,
  intro,
  items,
  tone = "check",
  columns = 1,
}: {
  heading: string;
  intro?: string;
  items: string[];
  tone?: "check" | "document" | "note";
  columns?: 1 | 2;
}) {
  if (!items || items.length === 0) return null;
  const ItemIcon = ICONS[tone];
  const iconColor = tone === "note" ? "text-[var(--color-highlight)]" : "text-[var(--color-primary)]";

  return (
    <ScrollReveal>
      <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)]">{heading}</h2>
      <span className="heading-rule" aria-hidden="true" />
      {intro && <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed">{intro}</p>}
      <ul className={`mt-6 grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-4"
          >
            <ItemIcon className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
            <span className="text-sm text-[var(--color-ink)] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </ScrollReveal>
  );
}
