import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms";
import { getServiceOptions } from "@/lib/servicesCms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { BookingForm } from "@/components/site/BookingForm";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `Book a Consultation | ${settings.businessName}`,
    description: `Book a consultation with ${settings.businessName}.`,
    path: "/booking",
    siteName: settings.businessName,
  });
}

export default async function BookingPage() {
  const services = await getServiceOptions();

  return (
    <>
      <PageHero
        eyebrow="Booking"
        heading="Book a Consultation"
        intro="Choose a date and time that works for you. We'll confirm your appointment shortly after you submit."
      />
      <section className="py-16">
        <Container className="max-w-2xl">
          <BookingForm services={services} />
        </Container>
      </section>
    </>
  );
}
