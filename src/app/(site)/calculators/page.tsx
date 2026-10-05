import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CalculatorCard } from "@/components/site/CalculatorCard";
import { DisclaimerNote } from "@/components/site/DisclaimerNote";
import { ButtonLink } from "@/components/ui/Button";
import { CALCULATORS } from "@/lib/calculatorsData";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `Immigration Point Calculators | ${settings.businessName}`,
    description:
      "Calculate your score for Express Entry, FSW, and seven provincial nominee and pilot programs — every tool runs right here on our site, built from each program's official published criteria.",
    path: "/calculators",
    siteName: settings.businessName,
  });
}

export default function CalculatorsHubPage() {
  return (
    <>
      <PageHero
        eyebrow="Free Immigration Tools"
        heading="Canadian Immigration Point Calculators"
        intro="Calculate your score for Express Entry, Federal Skilled Worker, and seven provincial nominee and pilot programs — every tool is built in-house and runs right here, no redirects to a government site."
      />

      <section className="py-14">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Calculators" }]} />
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CALCULATORS.map((entry, i) => (
              <CalculatorCard key={entry.slug} entry={entry} index={i} />
            ))}
          </div>

          <div className="mt-10">
            <DisclaimerNote
              text="Every calculator above is built and maintained by Swashray Immigration Services, modelled on each program's official published point grid or eligibility criteria (the exact source is cited inside each calculator). A few provincial programs do not publish their complete internal scoring formula, so those tools are best-effort estimates — this is flagged on the calculator itself wherever it applies. Results are estimates for general information only, are not an official government assessment, and do not guarantee an invitation or nomination. Point requirements and program rules change frequently; always confirm current criteria with the relevant government program and speak with a licensed consultant before making an application decision."
            />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-[var(--radius-card)] bg-[linear-gradient(135deg,var(--color-dark)_0%,var(--color-secondary)_55%,var(--color-primary)_100%)] p-7 sm:p-8">
            <div>
              <h2 className="font-heading text-xl font-semibold text-white">Not sure which program fits you?</h2>
              <p className="mt-1.5 text-sm text-white/75 leading-relaxed max-w-md">
                Book a one-on-one consultation and we'll map out the fastest, most realistic pathway for your
                profile — not just the calculator score.
              </p>
            </div>
            <ButtonLink href="/booking" variant="secondary" size="lg" className="shrink-0">
              Book a Consultation
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
