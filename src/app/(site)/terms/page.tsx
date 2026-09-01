import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Terms of Use" };

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero eyebrow="Legal" heading="Terms of Use" />
      <section className="py-16">
        <Container className="max-w-3xl space-y-6 text-[var(--color-muted)] leading-relaxed">
          <p>
            This is placeholder terms-of-use content for {settings.businessName}. It should be reviewed and
            finalized before public launch.
          </p>
          <p>
            By using this website, you agree that the information provided is general in nature and does not
            constitute legal or immigration advice. {settings.businessName} makes no guarantees regarding
            immigration outcomes, processing times, or eligibility.
          </p>
          <p>
            All content on this website is the property of {settings.businessName} unless otherwise noted, and may
            not be reproduced without permission.
          </p>
        </Container>
      </section>
    </>
  );
}
