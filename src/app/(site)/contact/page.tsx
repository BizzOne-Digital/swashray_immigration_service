import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import { getSiteSettings } from "@/lib/cms";
import { serialize } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { InquiryForm } from "@/components/site/InquiryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Contact Us | ${settings.businessName}`,
    description: `Get in touch with ${settings.businessName}.`,
  };
}

export default async function ContactPage() {
  await connectDB();
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    Service.find({ active: true }).sort({ order: 1 }).select("title").lean(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        heading="Send Us an Inquiry"
        intro="Tell us about your immigration goals and we'll follow up with next steps."
      />
      <section className="py-16">
        <Container className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <InquiryForm services={serialize(services)} />
          </div>
          <aside className="space-y-4 order-1 lg:order-2">
            <div className="rounded-[var(--radius-card)] border border-black/[0.06] p-6">
              <h3 className="font-heading font-semibold text-[var(--color-primary)] mb-4">{settings.businessName}</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-0.5 text-[var(--color-accent)] shrink-0" />
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="text-[var(--color-ink)] hover:text-[var(--color-primary)]">
                    {settings.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-[var(--color-accent)] shrink-0" />
                  <a href={`mailto:${settings.email}`} className="text-[var(--color-ink)] hover:text-[var(--color-primary)] break-all">
                    {settings.email}
                  </a>
                </li>
                {settings.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-[var(--color-accent)] shrink-0" />
                    <span className="text-[var(--color-ink)]">{settings.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
