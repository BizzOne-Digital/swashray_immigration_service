import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";

export function ServicePathCard({
  href,
  image,
  icon,
  title,
  shortDescription,
  suitableFor,
  index = 0,
}: {
  href: string;
  image?: string;
  icon: string;
  title: string;
  shortDescription: string;
  suitableFor?: string;
  index?: number;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={href}
      className="group relative block h-[400px] sm:h-[420px] rounded-[var(--radius-card)] overflow-hidden shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-lg hover:ring-[var(--color-accent)]/50 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
          <Icon name={icon} className="h-14 w-14 text-white/15" />
        </div>
      )}

      {/* Dark gradient scrim so the number/title/copy stay readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        <span className="block font-heading text-3xl sm:text-4xl font-semibold text-[var(--color-accent)] leading-none">
          {number}
        </span>
        <h3 className="mt-2.5 font-heading text-lg sm:text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-white/80 leading-relaxed line-clamp-2">{shortDescription}</p>
        {suitableFor && (
          <p className="mt-2 text-xs text-white/60 leading-relaxed line-clamp-1">
            <span className="font-semibold text-white/80">Suitable for: </span>
            {suitableFor}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] group-hover:gap-2.5 transition-all">
          Explore <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
