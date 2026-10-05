import { getSiteSettings, getThemeSettings, getNavigation, getActiveServices } from "@/lib/cms";
import { getCategories } from "@/lib/servicesCms";
import { buildThemeStyle } from "@/components/site/ThemeVars";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MotionProvider } from "@/components/site/MotionProvider";
import { mediaUrl } from "@/lib/utils";
import { getSiteUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, theme, navigation, services, categoryEntries] = await Promise.all([
    getSiteSettings(),
    getThemeSettings(),
    getNavigation(),
    getActiveServices(),
    getCategories(),
  ]);

  const categories = categoryEntries.map((c) => ({
    title: c.title,
    slug: c.slug,
    icon: c.icon,
    shortDescription: c.shortDescription,
  }));

  const siteUrl = getSiteUrl();
  const logoPath = mediaUrl(settings.logoMediaId as string | null | undefined);
  const sameAs = Object.values(settings.social || {}).filter(Boolean);

  // Organization/professional-service structured data, built only from real,
  // admin-entered SiteSettings values — nothing here is invented.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings.businessName,
    ...(settings.businessDescription ? { description: settings.businessDescription } : {}),
    url: siteUrl,
    ...(logoPath ? { logo: `${siteUrl}${logoPath}`, image: `${siteUrl}${logoPath}` } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.address ? { address: { "@type": "PostalAddress", streetAddress: settings.address } } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    areaServed: "CA",
  };

  return (
    <div style={buildThemeStyle(theme)} className="contents">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
      <MotionProvider>
        <Header
          businessName={settings.businessName}
          logoMediaId={settings.logoMediaId as string | null}
          navigation={navigation}
          services={services}
          categories={categories}
          social={settings.social}
        />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} navigation={navigation} />
      </MotionProvider>
    </div>
  );
}
