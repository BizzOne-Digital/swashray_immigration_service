import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import { getSiteSettings } from "@/lib/cms";
import { serialize, mediaUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/site/PageHero";
import { Icon } from "@/components/ui/IconMap";
import { DisclaimerNote } from "@/components/site/DisclaimerNote";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ServicePathCard } from "@/components/site/ServicePathCard";
import { buildMetadata, getSiteUrl, jsonLd } from "@/lib/seo";
import { getCategory, getServicesByCategory, getAllCategoryParams } from "@/lib/servicesData";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllCategoryParams();
}

async function getLegacyService(slug: string) {
  await connectDB();
  const service = await Service.findOne({ slug, active: true }).lean();
  return service ? serialize(service) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const settings = await getSiteSettings();
  const category = getCategory(categorySlug);

  if (category) {
    return buildMetadata({
      title: `${category.title} | ${settings.businessName}`,
      description: category.shortDescription,
      path: `/services/${categorySlug}`,
      siteName: settings.businessName,
    });
  }

  const legacy = await getLegacyService(categorySlug);
  if (!legacy) return {};
  return buildMetadata({
    title: legacy.seo?.title || `${legacy.title} | ${settings.businessName}`,
    description: legacy.seo?.description || legacy.shortDescription,
    path: `/services/${categorySlug}`,
    image: mediaUrl(legacy.featuredImageMediaId as string | null | undefined),
    siteName: settings.businessName,
  });
}

export default async function CategoryOrLegacyServicePage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  const siteUrl = getSiteUrl();

  if (category) {
    const services = getServicesByCategory(category.slug);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
        { "@type": "ListItem", position: 3, name: category.title, item: `${siteUrl}/services/${category.slug}` },
      ],
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-dark)_0%,var(--color-secondary)_55%,var(--color-primary)_100%)] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(60% 90% at 85% 0%, rgba(212,175,55,0.12) 0%, transparent 60%), radial-gradient(40% 60% at 0% 100%, rgba(181,18,27,0.10) 0%, transparent 65%)",
            }}
            aria-hidden="true"
          />
          <Container className="relative py-14 sm:py-18">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: category.title }]} light />
            <div className="mt-6 max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-3">
                Service Category
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">{category.title}</h1>
              <span className="heading-rule" aria-hidden="true" />
              {category.intro.map((p, i) => (
                <p key={i} className="mt-4 text-white/80 leading-relaxed text-lg">
                  {p}
                </p>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <ServicePathCard
                  key={service.slug}
                  href={`/services/${category.slug}/${service.slug}`}
                  icon={service.icon}
                  title={service.title}
                  shortDescription={service.shortDescription}
                  suitableFor={service.suitableFor}
                  index={i}
                />
              ))}
            </div>
            <div className="mt-12 text-center">
              <ButtonLink href="/services" variant="outline">
                Back to All Services
              </ButtonLink>
            </div>
          </Container>
        </section>
      </>
    );
  }

  // Not a new category slug — fall back to the original flat, admin-managed
  // Service record (preserves every pre-existing /services/<slug> URL).
  const legacy = await getLegacyService(categorySlug);
  if (!legacy) notFound();

  const settings = await getSiteSettings();
  const imageUrl = mediaUrl(legacy.featuredImageMediaId as string | null | undefined);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
      { "@type": "ListItem", position: 3, name: legacy.title, item: `${siteUrl}/services/${categorySlug}` },
    ],
  };
  const faqSchema =
    legacy.faq?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: legacy.faq.map((item: { question: string; answer: string }) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />}
      <PageHero eyebrow="Service" heading={legacy.title} intro={legacy.shortDescription} />

      <section className="py-16">
        <Container className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {imageUrl && (
              <div className="relative aspect-video rounded-[var(--radius-card)] overflow-hidden">
                <Image src={imageUrl} alt={legacy.title} fill className="object-cover" />
              </div>
            )}

            {legacy.description && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)] mb-4">Overview</h2>
                <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{legacy.description}</p>
              </div>
            )}

            {legacy.whoItsFor && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)] mb-4">Who This May Be For</h2>
                <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{legacy.whoItsFor}</p>
              </div>
            )}

            {legacy.process && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)] mb-6">Our Process</h2>
                {(() => {
                  const steps = legacy.process
                    .split("\n")
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                  if (steps.length <= 1) {
                    return <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{legacy.process}</p>;
                  }
                  return (
                    <ol className="space-y-5">
                      {steps.map((step: string, i: number) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold font-heading">
                            {i + 1}
                          </span>
                          <p className="text-[var(--color-muted)] leading-relaxed pt-1.5">{step}</p>
                        </li>
                      ))}
                    </ol>
                  );
                })()}
              </div>
            )}

            {legacy.faq?.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)] mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {legacy.faq.map((item: { question: string; answer: string }, i: number) => (
                    <details key={i} className="group rounded-[var(--radius-card)] border border-black/[0.06] p-5">
                      <summary className="cursor-pointer font-medium text-[var(--color-primary)] list-none flex items-center justify-between">
                        {item.question}
                        <span className="text-[var(--color-muted)] group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            <DisclaimerNote text={settings.disclaimerText} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-[var(--radius-card)] border border-black/[0.06] p-7 bg-[var(--color-primary)]/[0.03] sticky top-28">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)]/15 mb-4">
                <Icon name={legacy.icon} className="h-5 w-5 text-[var(--color-primary)]" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)]">Ready to discuss your situation?</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                Book a consultation or send an inquiry and we&apos;ll follow up with you.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink href={legacy.ctaUrl || "/booking"} className="justify-center">
                  {legacy.ctaText || "Book a Consultation"}
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline" className="justify-center">
                  Send an Inquiry
                </ButtonLink>
              </div>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
