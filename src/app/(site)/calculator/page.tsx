import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { CrsCalculator } from "@/components/site/CrsCalculator";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `Immigration Score Calculator | ${settings.businessName}`,
    description:
      "Estimate your Express Entry Comprehensive Ranking System (CRS) score based on the official IRCC point tables. Free, informational, and not an official eligibility determination.",
    path: "/calculator",
    siteName: settings.businessName,
  });
}

export default function CalculatorPage() {
  return (
    <>
      <PageHero
        eyebrow="Immigration Calculator"
        heading="Express Entry CRS Score Calculator"
        intro="Get an estimate of your Comprehensive Ranking System (CRS) score, based on the official Immigration, Refugees and Citizenship Canada (IRCC) point tables for Express Entry."
      />
      <section className="py-16">
        <Container>
          <CrsCalculator />
        </Container>
      </section>
    </>
  );
}
