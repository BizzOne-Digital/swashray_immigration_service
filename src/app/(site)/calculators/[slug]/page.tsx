import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GenericCalculator } from "@/components/site/calculators/GenericCalculator";
import { getCalculatorConfig, CALCULATOR_REGISTRY } from "@/lib/calculators/registry";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return Object.keys(CALCULATOR_REGISTRY).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = getCalculatorConfig(slug);
  const settings = await getSiteSettings();
  if (!config) {
    return buildMetadata({ title: `Calculator Not Found | ${settings.businessName}`, path: `/calculators/${slug}`, noIndex: true });
  }
  return buildMetadata({
    title: `${config.title} Calculator | ${settings.businessName}`,
    description: config.intro,
    path: `/calculators/${slug}`,
    siteName: settings.businessName,
  });
}

export default async function CalculatorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getCalculatorConfig(slug);
  if (!config) notFound();

  return (
    <>
      <PageHero eyebrow={config.authority} heading={`${config.title} Calculator`} intro={config.intro} />

      <section className="pt-14">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Calculators", href: "/calculators" },
              { label: config.title },
            ]}
          />
        </Container>
      </section>

      <section className="py-10 pb-20">
        <Container>
          <GenericCalculator slug={slug} />
        </Container>
      </section>
    </>
  );
}
