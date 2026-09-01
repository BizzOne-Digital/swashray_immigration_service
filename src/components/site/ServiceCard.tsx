import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/IconMap";
import { mediaUrl } from "@/lib/utils";
import type { IService } from "@/lib/models/Service";

export function ServiceCard({ service, index = 0 }: { service: IService; index?: number }) {
  const imageUrl = mediaUrl(service.featuredImageMediaId as string | null | undefined);

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      {imageUrl ? (
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="h-44 w-full flex items-center justify-center bg-[var(--color-primary)]/5">
          <Icon name={service.icon} className="h-12 w-12 text-[var(--color-primary)]/30" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)]/15 shrink-0">
            <Icon name={service.icon} className="h-4.5 w-4.5 text-[var(--color-primary)]" />
          </span>
          <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)]">{service.title}</h3>
        </div>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">{service.shortDescription}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] group-hover:gap-2.5 transition-all">
          Learn more <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
