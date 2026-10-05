import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import NewsArticle from "@/lib/models/NewsArticle";
import { getSiteUrl } from "@/lib/seo";

// This reads live data from MongoDB, so it must not be attempted at build
// time (mirrors the `dynamic = "force-dynamic"` used across the public
// site's pages, which depend on the same live CMS/database content).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  await connectDB();

  const [services, articles] = await Promise.all([
    Service.find({ active: true }).select("slug updatedAt").lean(),
    NewsArticle.find({ status: "published" }).select("slug updatedAt publishedAt").lean(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/services`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/calculator`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/calculators`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/news`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/booking`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/disclaimer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${siteUrl}/services/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const newsRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/news/${a.slug}`,
    lastModified: a.updatedAt || a.publishedAt || undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...serviceRoutes, ...newsRoutes];
}
