import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import NewsArticle from "@/lib/models/NewsArticle";
import { serialize, mediaUrl, formatDate } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { getSiteSettings } from "@/lib/cms";
import { buildMetadata, getSiteUrl, jsonLd } from "@/lib/seo";
import { BrandIllustration } from "@/components/site/BrandIllustration";

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
  const settings = await getSiteSettings();
  return buildMetadata({
    title: article.seo?.title || `${article.title} | ${settings.businessName}`,
    description: article.seo?.description || article.excerpt,
    path: `/news/${slug}`,
    image: mediaUrl(article.featuredImageMediaId as string | null | undefined),
    siteName: settings.businessName,
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const imageUrl = mediaUrl(article.featuredImageMediaId as string | null | undefined);
  const siteUrl = getSiteUrl();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
    author: { "@type": "Organization", name: article.author },
    image: imageUrl ? [`${siteUrl}${imageUrl}`] : undefined,
    mainEntityOfPage: `${siteUrl}/news/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <PageHero eyebrow={article.category} heading={article.title} />
      <section className="py-16">
        <Container className="max-w-3xl">
          <div className="flex items-center gap-3 text-sm text-[var(--color-muted)] mb-8">
            <span>{article.author}</span>
            <span aria-hidden>•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          <div className="relative aspect-video rounded-[var(--radius-card)] overflow-hidden mb-10 bg-[var(--color-primary)]/5">
            {imageUrl ? (
              <Image src={imageUrl} alt={article.title} fill className="object-cover" priority />
            ) : (
              <BrandIllustration icon="Newspaper" tone="muted" />
            )}
          </div>

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
