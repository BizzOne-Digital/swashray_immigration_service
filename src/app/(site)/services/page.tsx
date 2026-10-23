import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/IconMap";
import { PageHero } from "@/components/site/PageHero";
import { ServiceLinkCard } from "@/components/site/ServiceLinkCard";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { buildMetadata } from "@/lib/seo";
import { getServicesTree } from "@/lib/servicesCms";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `Our Services | ${settings.businessName}`,
    description:
      "Every Canadian immigration service we offer, by category — temporary residence, permanent residence, family sponsorship, citizenship, IRB representation, and other immigration matters.",
    path: "/services",
    siteName: settings.businessName,
  });
}

export default async function ServicesPage() {
  const tree = await getServicesTree();
  const serviceCount = tree.reduce((n, { services }) => n + services.length, 0);

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        heading="Our Services"
        intro="Full-spectrum Canadian immigration services — temporary residence, permanent residence, family sponsorship, citizenship, IRB representation, and specialized applications. Pick a category below to see every service we offer within it."
      />

      {/* Jump links to each category on this page */}
      <section className="border-b border-black/[0.05] bg-[var(--color-surface)]">
        <Container className="py-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            {tree.length} categories · {serviceCount} services
          </p>
          <nav aria-label="Service categories" className="flex flex-wrap gap-2.5">
            {tree.map(({ category }) => (
              <a
                key={category.slug}
                href={`#${category.slug}`}
                className="rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] transition-colors hover:bg-[var(--color-accent)]/25"
              >
                {category.title}
              </a>
            ))}
            <Link
              href="/calculators"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)]/50 hover:text-[var(--color-primary)]"
            >
              <Calculator className="h-3.5 w-3.5" /> Resources &amp; Tools
            </Link>
          </nav>
        </Container>
      </section>

      {tree.map(({ category, services }, i) => (
        <section
          key={category.slug}
          id={category.slug}
          className={`scroll-mt-28 py-16 sm:py-20 ${i % 2 === 1 ? "bg-[var(--color-primary)]/[0.03]" : ""}`}
        >
          <Container>
            <ScrollReveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex max-w-2xl items-start gap-4">
                <span className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-accent)]">
                  <Icon name={category.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    {String(i + 1).padStart(2, "0")} · {services.length} {services.length === 1 ? "service" : "services"}
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[var(--color-primary)]">
                    {category.title}
                  </h2>
                  <span className="heading-rule" aria-hidden="true" />
                  <p className="mt-3 leading-relaxed text-[var(--color-muted)]">{category.shortDescription}</p>
                </div>
              </div>
              <Link
                href={`/services/${category.slug}`}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] transition-all hover:gap-2.5"
              >
                Explore {category.title} <ArrowRight className="h-4 w-4 text-[var(--color-accent)]" />
              </Link>
            </ScrollReveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceLinkCard
                  key={service.slug}
                  href={`/services/${category.slug}/${service.slug}`}
                  image={service.image || category.image}
                  title={service.title}
                  shortDescription={service.shortDescription}
                  programs={service.programs?.map((p) => p.title)}
                />
              ))}
            </div>
          </Container>
        </section>
      ))}

      <section className="py-20 sm:py-24">
        <Container>
          <div className="rounded-[var(--radius-card)] bg-[var(--color-primary)] px-8 py-14 text-center text-white sm:px-16 sm:py-16">
            <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Not sure which service fits your situation?
            </h2>
            <span className="heading-rule heading-rule--center" aria-hidden="true" />
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/75">
              Book a consultation with our licensed RCIC-IRB. We&apos;ll review your circumstances and explain your options
              clearly before you commit to anything.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/booking" variant="secondary" size="lg">
                Book a Consultation
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Contact Us
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
