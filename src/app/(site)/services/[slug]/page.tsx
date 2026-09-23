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
import { buildMetadata, getSiteUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function getService(slug: string) {
  await connectDB();
  const service = await Service.findOne({ slug, active: true }).lean();
  return service ? serialize(service) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  const settings = await getSiteSettings();
  return buildMetadata({
    title: service.seo?.title || `${service.title} | ${settings.businessName}`,
    description: service.seo?.description || service.shortDescription,
    path: `/services/${slug}`,
    image: mediaUrl(service.featuredImageMediaId as string | null | undefined),
    siteName: settings.businessName,
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const settings = await getSiteSettings();
  const imageUrl = mediaUrl(service.featuredImageMediaId as string | null | undefined);
  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
      { "@type": "ListItem", position: 3, name: service.title, item: `${siteUrl}/services/${slug}` },
    ],
  };
  const faqSchema =
    service.faq?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: service.faq.map((item: { question: string; answer: string }) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      )}
      <PageHero eyebrow="Service" heading={service.title} intro={service.shortDescription} />

      <section className="py-16">
        <Container className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {imageUrl && (
              <div className="relative aspect-video rounded-[var(--radius-card)] overflow-hidden">
                <Image src={imageUrl} alt={service.title} fill className="object-cover" />
              </div>
            )}

            {service.description && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)] mb-4">Overview</h2>
                <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{service.description}</p>
              </div>
            )}

            {service.whoItsFor && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)] mb-4">Who This May Be For</h2>
                <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{service.whoItsFor}</p>
              </div>
            )}

            {service.process && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)] mb-6">Our Process</h2>
                {(() => {
                  const steps = service.process
                    .split("\n")
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                  // Content authored as a single paragraph (legacy/admin free-text)
                  // still renders sensibly as one plain block; content authored
                  // as one step per line renders as a numbered process list.
                  if (steps.length <= 1) {
                    return (
                      <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{service.process}</p>
                    );
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

            {service.faq?.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)] mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {service.faq.map((item: any, i: number) => (
                    <details key={i} className="group rounded-[var(--radius-card)] border border-black/[0.06] p-5">
                      <summary className="cursor-pointer font-medium text-[var(--color-primary)] list-none flex items-center justify-between">
                        {item.question}
                        <span className="text-[var(--color-muted)] group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </p>
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
                <Icon name={service.icon} className="h-5 w-5 text-[var(--color-primary)]" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)]">
                Ready to discuss your situation?
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                Book a consultation or send an inquiry and we&apos;ll follow up with you.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink href={service.ctaUrl || "/booking"} className="justify-center">
                  {service.ctaText || "Book a Consultation"}
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
