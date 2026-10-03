import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/IconMap";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";
import { ChecklistSection } from "@/components/site/ChecklistSection";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { RelatedServices } from "@/components/site/RelatedServices";
import { DisclaimerNote } from "@/components/site/DisclaimerNote";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import type { DetailContent } from "@/lib/servicesData";

/**
 * Shared template for both a full service page and a program (sub-pathway)
 * page — the two render identical section structure, differing only in
 * whether a "Types / Programs" section is injected after the overview, and
 * in their relatedSlugs. Kept as one component per the "data-driven
 * rendering, don't duplicate JSX" brief.
 */
export function ServiceDetailLayout({
  content,
  breadcrumb,
  eyebrow,
  programsSection,
  disclaimerText,
  relatedSlugs,
}: {
  content: DetailContent;
  breadcrumb: Crumb[];
  eyebrow: string;
  programsSection?: ReactNode;
  disclaimerText?: string;
  relatedSlugs: string[];
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-dark)_0%,var(--color-secondary)_55%,var(--color-primary)_100%)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 90% at 85% 0%, rgba(212,175,55,0.12) 0%, transparent 60%), radial-gradient(40% 60% at 0% 100%, rgba(181,18,27,0.10) 0%, transparent 65%)",
          }}
          aria-hidden="true"
        />
        <Container className="relative py-12 sm:py-16">
          <Breadcrumbs items={breadcrumb} light />
          <div className="mt-6 flex items-start gap-4 max-w-3xl">
            <span className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Icon name={content.icon} className="h-6 w-6 text-[var(--color-accent)]" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-3">{eyebrow}</p>
              <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">{content.title}</h1>
              <span className="heading-rule" aria-hidden="true" />
              <p className="mt-4 text-white/80 leading-relaxed">{content.shortDescription}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-14">
            <ScrollReveal>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)]">Overview</h2>
              <span className="heading-rule" aria-hidden="true" />
              <div className="mt-4 space-y-4">
                {content.overview.map((p, i) => (
                  <p key={i} className="text-[var(--color-muted)] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed">
                <span className="font-semibold text-[var(--color-ink)]">Who may consider this: </span>
                {content.suitableFor}
              </p>
            </ScrollReveal>

            {programsSection}

            <ChecklistSection heading="Eligibility Considerations" items={content.eligibility} tone="check" />

            <ScrollReveal>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-primary)]">How It Works</h2>
              <span className="heading-rule" aria-hidden="true" />
              <div className="mt-2">
                <ProcessTimeline steps={content.process} />
              </div>
            </ScrollReveal>

            <ChecklistSection
              heading="Documents You May Need"
              intro="Document requirements vary by applicant and pathway — not every applicant needs every item below. We confirm your specific list during an assessment."
              items={content.documents}
              tone="document"
              columns={2}
            />

            <ChecklistSection
              heading="Common Issues to Watch For"
              intro="These are presented to help you prepare, not to cause concern — most are avoidable with careful preparation."
              items={content.commonIssues}
              tone="note"
            />

            <ChecklistSection heading="How We Help" items={content.howWeHelp} tone="check" columns={2} />

            <FaqAccordion heading="Frequently Asked Questions" items={content.faq} />

            <DisclaimerNote
              text={
                disclaimerText ||
                "This information is general in nature and does not constitute legal or immigration advice. Program requirements can change — always verify current details with IRCC or book a consultation to discuss your specific situation."
              }
            />
          </div>

          <aside className="space-y-6">
            <div className="rounded-[var(--radius-card)] border border-black/[0.06] p-7 bg-[var(--color-primary)]/[0.03] sticky top-28">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)]/15 mb-4">
                <Icon name={content.icon} className="h-5 w-5 text-[var(--color-primary)]" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)]">
                Ready to discuss your situation?
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                Every situation is different. Book a consultation or send an inquiry and we&apos;ll help you work out whether
                this pathway fits, and what to do next.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink href="/booking" className="justify-center">
                  Book a Consultation
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline" className="justify-center">
                  Send an Inquiry
                </ButtonLink>
              </div>
            </div>
          </aside>
        </Container>
      </section>

      <RelatedServicesSection relatedSlugs={relatedSlugs} />
    </>
  );
}

function RelatedServicesSection({ relatedSlugs }: { relatedSlugs?: string[] }) {
  if (!relatedSlugs || relatedSlugs.length === 0) return null;
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <RelatedServices relatedSlugs={relatedSlugs} />
      </Container>
    </section>
  );
}
