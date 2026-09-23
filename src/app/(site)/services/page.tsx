import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import { getSiteSettings } from "@/lib/cms";
import { serialize } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { ServiceCard } from "@/components/site/ServiceCard";
import { EmptyState } from "@/components/site/EmptyState";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `Services | ${settings.businessName}`,
    description: "Immigration-related services offered by " + settings.businessName,
    path: "/services",
    siteName: settings.businessName,
  });
}

export default async function ServicesPage() {
  await connectDB();
  const services = serialize(await Service.find({ active: true }).sort({ order: 1 }).lean());

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        heading="Immigration Services"
        intro="General guidance across the most common immigration pathways. Every situation is different — a consultation lets us discuss what applies to yours."
      />
      <section className="py-20">
        <Container>
          {services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s: any, i: number) => (
                <ServiceCard key={s._id} service={s} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Services coming soon"
              message="The admin can add service categories from the dashboard — they'll appear here automatically."
            />
          )}
        </Container>
      </section>
    </>
  );
}
