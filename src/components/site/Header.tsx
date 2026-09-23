import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { MobileNav } from "@/components/site/MobileNav";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { INavigationItem } from "@/lib/models/NavigationItem";
import type { ISiteSettings } from "@/lib/models/SiteSettings";
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph, YouTubeGlyph } from "@/components/site/SocialIcons";

const SOCIAL_ICONS = {
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  linkedin: LinkedInGlyph,
  x: XGlyph,
  youtube: YouTubeGlyph,
} as const;

export function Header({
  businessName,
  logoMediaId,
  navigation,
  social,
}: {
  businessName: string;
  logoMediaId?: string | null;
  navigation: INavigationItem[];
  social?: ISiteSettings["social"];
}) {
  const socialEntries = (Object.keys(SOCIAL_ICONS) as Array<keyof typeof SOCIAL_ICONS>).filter(
    (key) => social?.[key]
  );

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur border-b border-black/5">
      <div className="hidden md:block border-b border-black/[0.04] bg-[var(--color-primary)]/[0.03]">
        <Container className="flex items-center justify-end gap-4 h-9">
          {socialEntries.length > 0 && (
            <div className="flex items-center gap-2.5 pr-4 border-r border-black/[0.08]">
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
          )}
          <LanguageSelector />
        </Container>
      </div>

      <Container className="relative flex items-center justify-between h-20">
        <Logo businessName={businessName} logoMediaId={logoMediaId} />

        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              target={item.openInNewTab ? "_blank" : undefined}
              className="px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <ButtonLink href="/booking" size="md">
            Book a Consultation
          </ButtonLink>
        </div>

        <MobileNav
          links={navigation.map((n) => ({ label: n.label, url: n.url, openInNewTab: n.openInNewTab }))}
          ctaText="Book a Consultation"
          ctaUrl="/booking"
          social={social}
        />
      </Container>
    </header>
  );
}
