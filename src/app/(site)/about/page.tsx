import Image from "next/image";
import type { Metadata } from "next";
import { getAboutContent } from "@/lib/cms";
import { mediaUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Icon } from "@/components/ui/IconMap";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutContent();
  return { title: about.seo.title, description: about.seo.description };
}

export default async function AboutPage() {
  const about = await getAboutContent();
  const introImage = mediaUrl(about.introImageMediaId as string | null | undefined);
  const approachImage = mediaUrl(about.approachImageMediaId as string | null | undefined);

  return (
    <>
      <PageHero eyebrow="About Us" heading={about.introHeading} />

      <section className="py-20">
        <Container className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <p className="text-[var(--color-muted)] leading-relaxed text-lg whitespace-pre-line">{about.introText}</p>
          </div>
          <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-[var(--color-primary)]/5">
            {introImage ? (
              <Image src={introImage} alt="About Swashray Immigration" fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Icon name="Compass" className="h-16 w-16 text-[var(--color-primary)]/25" />
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="py-20 bg-[var(--color-primary)]/[0.03]">
        <Container className="grid sm:grid-cols-2 gap-10">
          <div className="p-8 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-black/[0.05]">
            <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)]">{about.missionHeading}</h2>
            <p className="mt-4 text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{about.missionText}</p>
          </div>
          <div className="p-8 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-black/[0.05]">
            <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)]">{about.whyChooseHeading}</h2>
            <p className="mt-4 text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{about.whyChooseText}</p>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-[var(--color-primary)]/5 order-2 lg:order-1">
            {approachImage ? (
              <Image src={approachImage} alt="Our approach" fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Icon name="Handshake" className="h-16 w-16 text-[var(--color-primary)]/25" />
              </div>
            )}
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading heading={about.approachHeading} />
            <p className="mt-4 text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{about.approachText}</p>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <div className="rounded-[var(--radius-card)] bg-[var(--color-primary)] text-white px-8 py-14 sm:px-16 sm:py-16 text-center">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl mx-auto">
              {about.ctaHeading}
            </h2>
            <p className="mt-4 text-white/75 max-w-xl mx-auto leading-relaxed">{about.ctaText}</p>
            <div className="mt-8">
              <ButtonLink href={about.ctaButtonUrl} variant="secondary" size="lg">
                {about.ctaButtonText}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
