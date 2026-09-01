import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import NewsArticle, { NEWS_CATEGORIES } from "@/lib/models/NewsArticle";
import { getSiteSettings } from "@/lib/cms";
import { serialize } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { NewsCard } from "@/components/site/NewsCard";
import { EmptyState } from "@/components/site/EmptyState";
import Link from "next/link";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `News & Updates | ${settings.businessName}`,
    description: "Immigration news, visa updates, and announcements.",
  };
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  await connectDB();

  const filter: Record<string, unknown> = { status: "published" };
  if (category) filter.category = category;

  const articles = serialize(await NewsArticle.find(filter).sort({ publishedAt: -1 }).lean());

  return (
    <>
      <PageHero
        eyebrow="News & Updates"
        heading="Immigration News & Updates"
        intro="General updates from our team. For official policy details, always verify with government sources."
      />
      <section className="py-16">
        <Container>
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/news"
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                !category
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "border-black/10 text-[var(--color-muted)] hover:border-[var(--color-primary)]/30"
              )}
            >
              All
            </Link>
            {NEWS_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/news?category=${encodeURIComponent(c)}`}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  category === c
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "border-black/10 text-[var(--color-muted)] hover:border-[var(--color-primary)]/30"
                )}
              >
                {c}
              </Link>
            ))}
          </div>

          {articles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a: any, i: number) => (
                <NewsCard key={a._id} article={a} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No news published yet"
              message="Published articles from Admin → News & Updates will appear here."
            />
          )}
        </Container>
      </section>
    </>
  );
}
