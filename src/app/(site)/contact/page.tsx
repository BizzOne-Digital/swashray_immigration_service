import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { getSiteSettings } from "@/lib/cms";
import { getServiceOptions } from "@/lib/servicesCms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { ContactPanels } from "@/components/site/ContactPanels";
import { TrustBadge } from "@/components/site/TrustBadge";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `Contact Us | ${settings.businessName}`,
    description: `Get in touch with ${settings.businessName}, or book a consultation online.`,
    path: "/contact",
    siteName: settings.businessName,
  });
}

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSiteSettings(), getServiceOptions()]);

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        heading="Get in Touch"
        intro="Send us an inquiry or book a consultation online — whichever works best for you."
      />
      <section className="py-16">
        <Container className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ContactPanels services={services} />
          </div>
          <aside className="space-y-4 order-1 lg:order-2">
            <div className="rounded-[var(--radius-card)] border border-black/[0.06] border-t-2 border-t-[var(--color-accent)] bg-[var(--color-surface)] p-6">
              <h2 className="font-heading text-xl font-semibold text-[var(--color-primary)]">Contact Us</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{settings.businessName}</p>
              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                    className="group flex items-center gap-3 text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15">
                      <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-wide text-[var(--color-muted)]">Phone</span>
                      <span className="block font-medium">{settings.phone}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="group flex items-center gap-3 text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15">
                      <Mail className="h-4 w-4 text-[var(--color-primary)]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs uppercase tracking-wide text-[var(--color-muted)]">Email</span>
                      <span className="block font-medium break-all">{settings.email}</span>
                    </span>
                  </a>
                </li>
                {settings.address && (
                  <li className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15">
                      <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-wide text-[var(--color-muted)]">Address</span>
                      <span className="block font-medium text-[var(--color-ink)]">{settings.address}</span>
                    </span>
                  </li>
                )}
              </ul>
            </div>
            <TrustBadge text={settings.trustBadgeText} stacked />
          </aside>
        </Container>
      </section>
    </>
  );
}
