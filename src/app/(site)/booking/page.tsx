import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import { getSiteSettings } from "@/lib/cms";
import { serialize } from "@/lib/utils";
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
  await connectDB();
  const services = serialize(
    await Service.find({ active: true }).sort({ order: 1 }).select("title").lean()
  );

  return (
    <>
      <PageHero
        eyebrow="Booking"
        heading="Book a Consultation"
        intro="Choose a date and time that works for you. We'll confirm your appointment shortly after you submit."
      />
      <section className="py-16">
        <Container className="max-w-2xl">
          <BookingForm services={services.map((s: any) => ({ _id: s._id, title: s.title }))} />
        </Container>
      </section>
    </>
  );
}
