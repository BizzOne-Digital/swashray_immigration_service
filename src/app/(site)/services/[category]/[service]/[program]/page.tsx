import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/cms";
import { buildMetadata, getSiteUrl, jsonLd } from "@/lib/seo";
import { ServiceDetailLayout } from "@/components/site/ServiceDetailLayout";
import { getCategory, getProgram, getAllProgramParams } from "@/lib/servicesCms";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllProgramParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; service: string; program: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, service: serviceSlug, program: programSlug } = await params;
  const match = await getProgram(categorySlug, serviceSlug, programSlug);
  if (!match) return {};
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `${match.program.seoTitle} | ${settings.businessName}`,
    description: match.program.seoDescription,
    path: `/services/${categorySlug}/${serviceSlug}/${programSlug}`,
    siteName: settings.businessName,
  });
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ category: string; service: string; program: string }>;
}) {
  const { category: categorySlug, service: serviceSlug, program: programSlug } = await params;
  const category = await getCategory(categorySlug);
  const match = await getProgram(categorySlug, serviceSlug, programSlug);
  if (!category || !match) notFound();
  const { service, program } = match;

  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
      { "@type": "ListItem", position: 3, name: category.title, item: `${siteUrl}/services/${category.slug}` },
      { "@type": "ListItem", position: 4, name: service.title, item: `${siteUrl}/services/${category.slug}/${service.slug}` },
      {
        "@type": "ListItem",
        position: 5,
        name: program.title,
        item: `${siteUrl}/services/${category.slug}/${service.slug}/${program.slug}`,
      },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: program.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  // A program has no related-services list of its own — point back to its
  // parent service plus whatever that service itself relates to, so a
  // visitor can keep moving sideways or back up the hierarchy.
  const relatedSlugs = [`${category.slug}/${service.slug}`, ...service.relatedSlugs.filter((s) => s !== `${category.slug}/${service.slug}`)];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <ServiceDetailLayout
        content={program}
        eyebrow={`${service.title} Program`}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: category.title, href: `/services/${category.slug}` },
          { label: service.title, href: `/services/${category.slug}/${service.slug}` },
          { label: program.title },
        ]}
        relatedSlugs={relatedSlugs}
        disclaimerText={settings.disclaimerText}
      />
    </>
  );
}
