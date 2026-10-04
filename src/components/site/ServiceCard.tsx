import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";
import { mediaUrl } from "@/lib/utils";
import { getCategory } from "@/lib/servicesData";
import type { IService } from "@/lib/models/Service";

const SERVICE_IMAGES: Record<string, string> = {
  "visitor-visa": "/images/services/visitor-visa.png",
  "work-permits": "/images/services/work-permits.png",
  "study-permits": "/images/services/study-permits.png",
  "passport-services": "/images/services/passport-services.png",
};

export function ServiceCard({ service, index = 0 }: { service: IService; index?: number }) {
  const imageUrl = SERVICE_IMAGES[service.slug] || getCategory(service.slug)?.image || mediaUrl(service.featuredImageMediaId as string | null | undefined);
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative block h-[420px] sm:h-[450px] rounded-[var(--radius-card)] overflow-hidden shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-lg hover:ring-[var(--color-accent)]/50 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
          <Icon name={service.icon} className="h-16 w-16 text-white/15" />
        </div>
      )}

      {/* Dark gradient scrim so the number/title/copy stay readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
        <span className="block font-heading text-4xl sm:text-5xl font-semibold text-[var(--color-accent)] leading-none">
          {number}
        </span>
        <h3 className="mt-3 font-heading text-xl sm:text-2xl font-semibold text-white">{service.title}</h3>
        <p className="mt-2.5 text-sm text-white/80 leading-relaxed line-clamp-3">{service.shortDescription}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] group-hover:gap-2.5 transition-all">
          View Services <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
