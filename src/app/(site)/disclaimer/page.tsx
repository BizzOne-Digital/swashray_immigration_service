import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Disclaimer" };

export default async function DisclaimerPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero eyebrow="Legal" heading="General Information Disclaimer" />
      <section className="py-16">
        <Container className="max-w-3xl">
          <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{settings.disclaimerText}</p>
          <p className="mt-6 text-[var(--color-muted)] leading-relaxed">
            {settings.businessName} is not a government body and does not provide official government services.
            Nothing on this website should be interpreted as a guarantee of any immigration outcome.
          </p>
        </Container>
      </section>
    </>
  );
}
