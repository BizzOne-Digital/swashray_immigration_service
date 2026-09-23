import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import NewsArticle from "@/lib/models/NewsArticle";
import { getHomeContent, getSiteSettings } from "@/lib/cms";
import { serialize, mediaUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { NewsCard } from "@/components/site/NewsCard";
import { EmptyState } from "@/components/site/EmptyState";
import { TrustBadge } from "@/components/site/TrustBadge";
import { Icon } from "@/components/ui/IconMap";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { HeroParallax } from "@/components/site/HeroParallax";
import { BrandIllustration } from "@/components/site/BrandIllustration";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { ScoreGaugeIllustration } from "@/components/site/ScoreGaugeIllustration";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHomeContent(), getSiteSettings()]);
  return buildMetadata({
    title: home.seo.title,
    description: home.seo.description,
    path: "/",
    image: mediaUrl(home.heroImageMediaId as string | null | undefined),
    siteName: settings.businessName,
  });
}

export default async function HomePage() {
  await connectDB();
  const [home, settings, services, news] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    Service.find({ active: true }).sort({ order: 1 }).limit(6).lean(),
    NewsArticle.find({ status: "published" }).sort({ featured: -1, publishedAt: -1 }).limit(3).lean(),
  ]);

  const heroImage = mediaUrl(home.heroImageMediaId as string | null | undefined);
  const servicesList = serialize(services);
  const newsList = serialize(news);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[var(--color-primary)] text-white">
        <HeroParallax className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

        <Container className="relative py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="min-w-0 animate-fade-in-up">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-accent)] mb-5">
              Immigration Guidance You Can Trust
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08]">
              {home.heroHeadline.includes(" | ") ? (
                home.heroHeadline.split(" | ").map((part: string, i: number, arr: string[]) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <>
                        {" "}
                        <span className="text-[var(--color-accent)]">|</span>{" "}
                      </>
                    )}
                  </span>
                ))
              ) : (
                home.heroHeadline
              )}
            </h1>
            <p className="mt-6 text-white/75 text-lg leading-relaxed max-w-xl">{home.heroSubheading}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href={home.primaryCtaUrl} variant="secondary" size="lg">
                {home.primaryCtaText}
              </ButtonLink>
              <ButtonLink
                href={home.secondaryCtaUrl}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                {home.secondaryCtaText}
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-w-0 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden ring-1 ring-white/10 bg-white/5">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={home.heroHeadline}
                  fill
                  className="object-cover animate-kenburns"
                  priority
                />
              ) : (
                <BrandIllustration icon="Globe2" tone="light" />
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* TRUST BADGE STRIP */}
      <section className="py-10 border-b border-black/[0.05]">
        <Container className="max-w-2xl">
          <ScrollReveal>
            <TrustBadge
              logoMediaId={settings.logoMediaId as string | null}
              text={settings.trustBadgeText}
              businessName={settings.businessName}
            />
          </ScrollReveal>
        </Container>
      </section>

      {/* CALCULATOR TEASER */}
      <section className="py-20 sm:py-24 bg-[var(--color-primary)]/[0.03]">
        <Container className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-4">
              Free Immigration Tool
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-primary)]">
              {home.calculatorHeading}
            </h2>
            <p className="mt-4 text-[var(--color-muted)] leading-relaxed max-w-lg">{home.calculatorIntro}</p>
            <div className="mt-8">
              <ButtonLink href="/calculator" size="lg">
                {home.calculatorCtaText}
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-[var(--color-muted)]">
              Results are estimates for informational purposes only and do not constitute legal or immigration advice.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={120} className="flex justify-center">
            <ScoreGaugeIllustration />
          </ScrollReveal>
        </Container>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal>
            <SectionHeading eyebrow="What We Help With" heading={home.servicesHeading} intro={home.servicesIntro} />
          </ScrollReveal>
          <div className="mt-12">
            {servicesList.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesList.map((s: any, i: number) => (
                  <ServiceCard key={s._id} service={s} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Services coming soon"
                message="The admin can add service categories from the dashboard — they'll appear here automatically."
              />
            )}
          </div>
          {servicesList.length > 0 && (
            <div className="mt-10 text-center">
              <ButtonLink href="/services" variant="outline">
                View All Services
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      {/* BOOKING SECTION */}
      <section className="py-20 sm:py-28">
        <Container className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-4">
              Consultation Booking
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-primary)]">
              {home.bookingHeading}
            </h2>
            <p className="mt-4 text-[var(--color-muted)] leading-relaxed max-w-lg">{home.bookingIntro}</p>
            <ul className="mt-6 space-y-3">
              {home.bookingHighlights.map((h: string) => (
                <li key={h} className="flex items-start gap-3 text-sm text-[var(--color-ink)]">
                  <CheckCircle2 className="h-5 w-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href="/booking" size="lg">
                {home.bookingCtaText}
              </ButtonLink>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={120} className="rounded-[var(--radius-card)] bg-[var(--color-primary)] text-white p-10 sm:p-12">
            <h3 className="font-heading text-xl font-semibold">{home.trustHeading}</h3>
            <p className="mt-3 text-white/75 text-sm leading-relaxed">{settings.trustBadgeText}</p>
            <div className="mt-6">
              <TrustBadge
                logoMediaId={settings.logoMediaId as string | null}
                text={settings.businessName}
                businessName={settings.businessName}
                variant="dark"
              />
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 sm:py-28 bg-[var(--color-primary)]/[0.03]">
        <Container>
          <ScrollReveal>
            <SectionHeading eyebrow="Why Swashray" heading={home.whyChooseHeading} intro={home.whyChooseIntro} align="center" />
          </ScrollReveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {home.benefits.map((b: any, i: number) => (
              <ScrollReveal
                key={b.title}
                delay={Math.min(i, 6) * 60}
                className="text-center p-6 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-black/[0.05]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/15 mb-4">
                  <Icon name={b.icon} className="h-5.5 w-5.5 text-[var(--color-primary)]" />
                </span>
                <h3 className="font-heading font-semibold text-[var(--color-primary)]">{b.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">{b.text}</p>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* JOURNEY */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal>
            <SectionHeading eyebrow="The Process" heading={home.journeyHeading} intro={home.journeyIntro} align="center" />
          </ScrollReveal>
          <ProcessTimeline steps={home.journeySteps} />
        </Container>
      </section>

      {/* NEWS PREVIEW */}
      <section className="py-20 sm:py-28 bg-[var(--color-primary)]/[0.03]">
        <Container>
          <ScrollReveal>
            <SectionHeading eyebrow="Stay Informed" heading={home.newsHeading} intro={home.newsIntro} />
          </ScrollReveal>
          <div className="mt-12">
            {newsList.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsList.map((a: any, i: number) => (
                  <NewsCard key={a._id} article={a} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No news published yet"
                message="Published articles from Admin → News & Updates will appear here."
              />
            )}
          </div>
          {newsList.length > 0 && (
            <div className="mt-10 text-center">
              <ButtonLink href="/news" variant="outline">
                View All News
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="rounded-[var(--radius-card)] bg-[var(--color-primary)] text-white px-8 py-14 sm:px-16 sm:py-16 text-center">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl mx-auto">
              {home.ctaHeading}
            </h2>
            <p className="mt-4 text-white/75 max-w-xl mx-auto leading-relaxed">{home.ctaText}</p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <ButtonLink href={home.ctaPrimaryUrl} variant="secondary" size="lg">
                {home.ctaPrimaryText}
              </ButtonLink>
              <ButtonLink
                href={home.ctaSecondaryUrl}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                {home.ctaSecondaryText}
              </ButtonLink>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* CONTACT PREVIEW */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <ScrollReveal className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <a
              href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-4 p-6 rounded-[var(--radius-card)] border border-black/[0.06] hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/8 shrink-0">
                <Phone className="h-5 w-5 text-[var(--color-primary)]" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Call Us</p>
                <p className="font-medium text-[var(--color-primary)]">{settings.phone}</p>
              </div>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-4 p-6 rounded-[var(--radius-card)] border border-black/[0.06] hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/8 shrink-0">
                <Mail className="h-5 w-5 text-[var(--color-primary)]" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Email Us</p>
                <p className="font-medium text-[var(--color-primary)] break-all">{settings.email}</p>
              </div>
            </a>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
