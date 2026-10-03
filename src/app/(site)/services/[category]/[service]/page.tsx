import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/cms";
import { buildMetadata, getSiteUrl, jsonLd } from "@/lib/seo";
import { ServiceDetailLayout } from "@/components/site/ServiceDetailLayout";
import { ServicePathCard } from "@/components/site/ServicePathCard";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { getCategory, getService, getAllServiceParams } from "@/lib/servicesData";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllServiceParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, service: serviceSlug } = await params;
  const service = getService(categorySlug, serviceSlug);
  if (!service) return {};
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `${service.seoTitle} | ${settings.businessName}`,
    description: service.seoDescription,
    path: `/services/${categorySlug}/${serviceSlug}`,
    siteName: settings.businessName,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}) {
  const { category: categorySlug, service: serviceSlug } = await params;
  const category = getCategory(categorySlug);
  const service = getService(categorySlug, serviceSlug);
  if (!category || !service) notFound();

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
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const programsSection =
    service.programs && service.programs.length > 0 ? (
      <ScrollReveal>
        <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)]">
          {service.title} Programs
        </h2>
        <span className="heading-rule" aria-hidden="true" />
        <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed">
          {service.title} contains more than one pathway. Each works a little differently — explore the one that
          best matches your background.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 gap-5">
          {service.programs.map((program, i) => (
            <ServicePathCard
              key={program.slug}
              href={`/services/${category.slug}/${service.slug}/${program.slug}`}
              icon={program.icon}
              title={program.title}
              shortDescription={program.shortDescription}
              suitableFor={program.suitableFor}
              keyConsiderations={program.keyConsiderations}
              index={i}
            />
          ))}
        </div>
      </ScrollReveal>
    ) : undefined;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <ServiceDetailLayout
        content={service}
        eyebrow={category.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: category.title, href: `/services/${category.slug}` },
          { label: service.title },
        ]}
        programsSection={programsSection}
        relatedSlugs={service.relatedSlugs}
        disclaimerText={settings.disclaimerText}
      />
    </>
  );
}
