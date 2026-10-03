import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { MobileNav } from "@/components/site/MobileNav";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/IconMap";
import { Container } from "@/components/ui/Container";
import type { INavigationItem } from "@/lib/models/NavigationItem";
import type { ISiteSettings } from "@/lib/models/SiteSettings";
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph, YouTubeGlyph } from "@/components/site/SocialIcons";
import { CATEGORIES } from "@/lib/servicesData";

const SOCIAL_ICONS = {
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  linkedin: LinkedInGlyph,
  x: XGlyph,
  youtube: YouTubeGlyph,
} as const;

export interface NavService {
  title: string;
  slug: string;
  icon: string;
}

export function Header({
  businessName,
  logoMediaId,
  navigation,
  services,
  social,
}: {
  businessName: string;
  logoMediaId?: string | null;
  navigation: INavigationItem[];
  services?: NavService[];
  social?: ISiteSettings["social"];
}) {
  const socialEntries = (Object.keys(SOCIAL_ICONS) as Array<keyof typeof SOCIAL_ICONS>).filter(
    (key) => social?.[key]
  );

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur border-b border-black/5">
      {socialEntries.length > 0 && (
        <div className="hidden md:block border-b border-black/[0.04] bg-[var(--color-primary)]/[0.03]">
          <Container className="flex items-center justify-end gap-4 h-9">
            <div className="flex items-center gap-2.5">
              {socialEntries.map((key) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a
                    key={key}
                    href={social?.[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </Container>
        </div>
      )}

      <Container className="relative flex items-center justify-between h-20">
        <Logo businessName={businessName} logoMediaId={logoMediaId} />

        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isPrograms = item.url === "/services";
            if (!isPrograms) {
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  target={item.openInNewTab ? "_blank" : undefined}
                  className="group relative px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {item.label}
                  <span className="absolute left-4 right-4 bottom-1 h-[2px] origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-250 ease-out group-hover:scale-x-100" aria-hidden="true" />
                </Link>
              );
            }
            return (
              <div key={item.url} className="relative group">
                <Link
                  href={item.url}
                  className="relative flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  <span className="absolute left-4 right-7 bottom-1 h-[2px] origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-250 ease-out group-hover:scale-x-100" aria-hidden="true" />
                </Link>
                <div
                  className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                >
                  <div className="w-[560px] rounded-[var(--radius-card)] border border-black/[0.06] border-t-2 border-t-[var(--color-accent)] bg-[var(--color-surface)] shadow-brand p-4">
                    <div className="grid grid-cols-2 gap-1">
                      {CATEGORIES.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/services/${c.slug}`}
                          className="flex items-start gap-3 rounded-md p-2.5 hover:bg-[var(--color-primary)]/5 transition-colors"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15">
                            <Icon name={c.icon} className="h-4 w-4 text-[var(--color-primary)]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-[var(--color-ink)] leading-snug">{c.title}</span>
                            <span className="block text-xs text-[var(--color-muted)] leading-snug mt-0.5 line-clamp-1">
                              {c.shortDescription}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-2 pt-3 border-t border-black/[0.06]">
                      <Link
                        href="/services"
                        className="flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:gap-2.5 transition-all py-1.5"
                      >
                        View All Services
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ButtonLink href="/booking" size="md">
            Book a Consultation
          </ButtonLink>
          <LanguageSelector />
        </div>

        <MobileNav
          links={navigation.map((n) => ({ label: n.label, url: n.url, openInNewTab: n.openInNewTab }))}
          services={services}
          ctaText="Book a Consultation"
          ctaUrl="/booking"
          social={social}
        />
      </Container>
    </header>
  );
}
