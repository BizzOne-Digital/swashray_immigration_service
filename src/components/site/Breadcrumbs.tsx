import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  const base = light ? "text-white/60" : "text-[var(--color-muted)]";
  const current = light ? "text-white" : "text-[var(--color-primary)]";
  const hover = light ? "hover:text-white" : "hover:text-[var(--color-primary)]";

  return (
    <nav aria-label="Breadcrumb" className="overflow-x-auto">
      <ol className={`flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm ${base}`}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />}
              {item.href && !isLast ? (
                <Link href={item.href} className={`transition-colors ${hover}`}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? `font-medium ${current}` : undefined} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
