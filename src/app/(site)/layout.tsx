import { getSiteSettings, getThemeSettings, getNavigation, getActiveServices } from "@/lib/cms";
import { buildThemeStyle } from "@/components/site/ThemeVars";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { mediaUrl } from "@/lib/utils";
import { getSiteUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, theme, navigation, services] = await Promise.all([
    getSiteSettings(),
    getThemeSettings(),
    getNavigation(),
    getActiveServices(),
  ]);

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
      <Header
        businessName={settings.businessName}
        logoMediaId={settings.logoMediaId as string | null}
        navigation={navigation}
        services={services}
        social={settings.social}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} navigation={navigation} />
    </div>
  );
}
