import { Logo } from "@/components/site/Logo";
import { MobileNav } from "@/components/site/MobileNav";
import { HeaderNav } from "@/components/site/HeaderNav";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import { ButtonLink } from "@/components/ui/Button";
import type { INavigationItem } from "@/lib/models/NavigationItem";
import type { ISiteSettings } from "@/lib/models/SiteSettings";

export interface NavCategory {
  title: string;
  slug: string;
  icon: string;
  shortDescription: string;
}

export function Header({
  businessName,
  logoMediaId,
  navigation,
  categories,
  social,
  phone,
  email,
}: {
  businessName: string;
  logoMediaId?: string | null;
  navigation: INavigationItem[];
  categories: NavCategory[];
  social?: ISiteSettings["social"];
  phone?: string;
  email?: string;
}) {
  const links = navigation.map((n) => ({ label: n.label, url: n.url, openInNewTab: n.openInNewTab }));
  // The Calculators dropdown always sits right after "Our Services". If the
  // admin menu already has a /calculators item, that item's label and
  // position are used instead.
  if (!links.some((link) => link.url === "/calculators")) {
    const servicesIndex = links.findIndex((link) => link.url === "/services");
    links.splice(servicesIndex === -1 ? links.length : servicesIndex + 1, 0, {
      label: "Calculators",
      url: "/calculators",
      openInNewTab: false,
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-accent)]/20 bg-[var(--color-surface)]/95 backdrop-blur-lg">
      <div className="relative mx-auto flex min-h-24 w-full max-w-7xl items-center gap-4 px-5 py-2 sm:px-8 xl:gap-6">
        <div className="mr-auto shrink-0">
          <Logo businessName={businessName} logoMediaId={logoMediaId} eager compact />
        </div>

        <HeaderNav links={links} categories={categories} />

        <div className="hidden shrink-0 items-center gap-5 xl:flex">
          <ButtonLink href="/booking" variant="secondary" size="md" className="whitespace-nowrap rounded-lg px-4 text-[0.875rem] tracking-normal">
            Book a Consultation
          </ButtonLink>
          <LanguageSelector />
        </div>

        <MobileNav
          links={links}
          categories={categories}
          ctaText="Book a Consultation"
          ctaUrl="/booking"
          social={social}
          phone={phone}
          email={email}
        />
      </div>
    </header>
  );
}
