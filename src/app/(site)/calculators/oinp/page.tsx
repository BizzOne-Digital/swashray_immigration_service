import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { OinpCalculator } from "@/components/site/calculators/OinpCalculator";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `OINP Calculator | ${settings.businessName}`,
    description:
      "Estimate your Ontario Immigrant Nominee Program (OINP) points for the Ontario Workforce Priority stream, built from Ontario's official Expression of Interest scoring grid.",
    path: "/calculators/oinp",
    siteName: settings.businessName,
  });
}

export default async function OinpCalculatorPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Ontario Immigrant Nominee Program"
        heading="OINP Calculator"
        intro="Estimate your Expression of Interest points for the Ontario Workforce Priority stream. Answer each factor and your score updates as you go."
      />

      <section className="pt-14">
        <Container>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculators" }, { label: "OINP Calculator" }]}
          />
        </Container>
      </section>

      <section className="py-10 pb-20">
        <Container>
          <OinpCalculator contactPhone={settings.phone} contactEmail={settings.email} />
        </Container>
      </section>
    </>
  );
}
