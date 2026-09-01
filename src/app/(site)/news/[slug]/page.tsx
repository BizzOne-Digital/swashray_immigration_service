import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import NewsArticle from "@/lib/models/NewsArticle";
import { serialize, mediaUrl, formatDate } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  await connectDB();
  const article = await NewsArticle.findOne({ slug, status: "published" }).lean();
  return article ? serialize(article) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt,
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const imageUrl = mediaUrl(article.featuredImageMediaId as string | null | undefined);

  return (
    <>
      <PageHero eyebrow={article.category} heading={article.title} />
      <section className="py-16">
        <Container className="max-w-3xl">
          <div className="flex items-center gap-3 text-sm text-[var(--color-muted)] mb-8">
            <span>{article.author}</span>
            <span aria-hidden>•</span>
            <span>{formatDate(article.publishedAt)}</span>
            {article.isDemo && (
              <span className="rounded-full bg-black/70 text-white text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1">
                Demo Content
              </span>
            )}
          </div>

          {imageUrl && (
            <div className="relative aspect-video rounded-[var(--radius-card)] overflow-hidden mb-10">
              <Image src={imageUrl} alt={article.title} fill className="object-cover" priority />
            </div>
          )}

          <div className="prose-swashray text-[var(--color-ink)] leading-relaxed whitespace-pre-line">
            {article.content}
          </div>

          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-black/[0.06]">
              {article.tags.map((t: string) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-primary)]/5 text-[var(--color-primary)]">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-12 flex gap-4">
            <ButtonLink href="/news" variant="outline">
              Back to News
            </ButtonLink>
            <ButtonLink href="/contact">Ask a Question</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
