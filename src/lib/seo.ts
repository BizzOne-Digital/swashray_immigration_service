import type { Metadata } from "next";

/**
 * The public base URL of the deployed site, used to resolve canonical URLs,
 * Open Graph URLs/images, and the sitemap. Falls back to localhost for local
 * development. Set NEXT_PUBLIC_SITE_URL in production (see .env.example).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

/**
 * Builds a consistent Metadata object (title, description, canonical URL,
 * Open Graph, and Twitter card) for a public page. Pass a page-relative
 * `path` (e.g. "/about", "/services/work-permits", or "/" for the homepage).
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  siteName,
  type = "website",
  publishedTime,
  noIndex,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  siteName?: string;
  type?: "website" | "article";
  publishedTime?: string | Date | null;
  noIndex?: boolean;
}): Metadata {
  const description2 = description || undefined;
  const images = image ? [{ url: image }] : undefined;

  return {
    // Every caller already composes a complete, final title (from CMS SEO
    // fields or a hand-built string) — use `absolute` so the root layout's
    // "%s | Swashray Immigration Services Inc." template never doubles up.
    title: { absolute: title },
    description: description2,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: description2,
      url: path,
      siteName,
      type,
      images,
      ...(type === "article" && publishedTime
        ? { publishedTime: new Date(publishedTime).toISOString() }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: description2,
      images: image ? [image] : undefined,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Escapes `<` so JSON-LD embedded in a <script> tag can't be broken out of. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
