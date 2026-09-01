import { getSiteSettings, getThemeSettings, getNavigation } from "@/lib/cms";
import { buildThemeStyle } from "@/components/site/ThemeVars";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, theme, navigation] = await Promise.all([
    getSiteSettings(),
    getThemeSettings(),
    getNavigation(),
  ]);

  return (
    <div style={buildThemeStyle(theme)} className="contents">
      <Header
        businessName={settings.businessName}
        logoMediaId={settings.logoMediaId as string | null}
        navigation={navigation}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} navigation={navigation} />
    </div>
  );
}
