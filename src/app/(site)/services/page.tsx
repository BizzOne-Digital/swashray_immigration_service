import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { CategoryCard } from "@/components/site/CategoryCard";
import { buildMetadata } from "@/lib/seo";
import { getCategories } from "@/lib/servicesCms";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: `Services | ${settings.businessName}`,
    description:
      "Explore our Canadian immigration services by category — temporary residence, permanent residence, family sponsorship, citizenship, IRB representation, and more.",
    path: "/services",
    siteName: settings.businessName,
  });
}

export default async function ServicesPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        heading="Explore Our Immigration Services"
        intro="We organize our services around the most common immigration goals. Choose a category to see the specific pathways and programs within it, then explore the one that fits your situation."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, i) => (
              <CategoryCard key={category.slug} category={category} index={i} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
