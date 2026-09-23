import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero eyebrow="Legal" heading="Privacy Policy" />
      <section className="py-16">
        <Container className="max-w-3xl space-y-6 text-[var(--color-muted)] leading-relaxed">
          <p>
            This is placeholder privacy policy content for {settings.businessName}. It should be reviewed and
            finalized to reflect exactly what information is collected (such as inquiry and booking form
            submissions), how it is stored, who can access it, and how long it is retained.
          </p>
          <p>
            Information submitted through our inquiry and booking forms — including your name, email, phone
            number, and message — is stored securely and used only to respond to your request. We do not sell or
            share your information with third parties for marketing purposes.
          </p>
          <p>
            If you have questions about your information, please contact us at{" "}
            <a href={`mailto:${settings.email}`} className="text-[var(--color-primary)] underline">
              {settings.email}
            </a>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
