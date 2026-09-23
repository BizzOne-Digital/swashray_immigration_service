import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { mediaUrl, formatDate } from "@/lib/utils";
import type { INewsArticle } from "@/lib/models/NewsArticle";
import { BrandIllustration } from "@/components/site/BrandIllustration";

export function NewsCard({ article, index = 0 }: { article: INewsArticle; index?: number }) {
  const imageUrl = mediaUrl(article.featuredImageMediaId as string | null | undefined);

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="relative h-44 w-full overflow-hidden bg-[var(--color-primary)]/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <BrandIllustration icon="Newspaper" tone="muted" />
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] mb-3">
          <span className="font-semibold text-[var(--color-accent)] uppercase tracking-wide">{article.category}</span>
          <span aria-hidden>•</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)] leading-snug">
          {article.title}
        </h3>
        <p className="mt-2.5 text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">{article.excerpt}</p>
        <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] group-hover:gap-2.5 transition-all">
          Read More <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
