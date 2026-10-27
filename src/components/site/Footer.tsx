import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { RcicIrbLogo } from "@/components/site/RcicIrbLogo";
import { Container } from "@/components/ui/Container";
import type { ISiteSettings } from "@/lib/models/SiteSettings";
import type { INavigationItem } from "@/lib/models/NavigationItem";
import type { NavCategory } from "@/components/site/Header";
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph, YouTubeGlyph } from "@/components/site/SocialIcons";

const SOCIAL_ICONS = {
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  linkedin: LinkedInGlyph,
  x: XGlyph,
  youtube: YouTubeGlyph,
} as const;

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-4">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-highlight)]" aria-hidden="true" />
      {children}
    </h3>
  );
}

export function Footer({
  settings,
  navigation,
  categories,
}: {
  settings: ISiteSettings;
  navigation: INavigationItem[];
  categories: NavCategory[];
}) {
  const socialEntries = (Object.keys(SOCIAL_ICONS) as Array<keyof typeof SOCIAL_ICONS>).filter(
    (key) => settings.social?.[key]
  );
  // "Company" = the admin-managed menu minus Home, the services dropdown
  // (which has its own column) and the calculators (listed there as
  // Resources & Tools), plus the booking page — each URL once.
  const companyLinks = [
    ...navigation.filter((item) => !["/", "/services", "/calculators", "/booking"].includes(item.url)),
    { label: "Book a Consultation", url: "/booking" },
  ].filter((item, i, all) => all.findIndex((other) => other.url === item.url) === i);

  return (
    <footer className="mt-auto relative bg-white text-[var(--color-ink)]">
      {/* hairline gold signature line across the very top of the footer */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent)]/40 to-transparent" aria-hidden="true" />
      <Container className="py-14 grid gap-10 sm:grid-cols-2 lg:gap-x-8 lg:grid-cols-[1.2fr_1fr_0.8fr_1.3fr]">
        <div className="space-y-5">
          <Logo businessName={settings.businessName} logoMediaId={settings.logoMediaId as string | null} />
          <p className="text-sm text-[var(--color-muted)] max-w-sm leading-relaxed">{settings.footerDescription}</p>
          <span className="inline-flex">
            <RcicIrbLogo className="h-12" sizes="180px" />
          </span>
        </div>

        <div>
          <FooterHeading>Our Services</FooterHeading>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/services/${c.slug}`} className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                  {c.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/calculators" className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                Resources &amp; Tools
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <FooterHeading>Company</FooterHeading>
          <ul className="space-y-2.5 text-sm">
            {companyLinks.map((item) => (
              <li key={item.url}>
                <Link href={item.url} className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterHeading>Contact Us</FooterHeading>
          <ul className="space-y-3 text-sm text-[var(--color-muted)]">
            <li>
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2.5 hover:text-[var(--color-primary)]">
                <Phone className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 hover:text-[var(--color-primary)] whitespace-nowrap">
                <Mail className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                {settings.email}
              </a>
            </li>
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
          {socialEntries.length > 0 && (
            <div className="flex gap-3 pt-5">
              {socialEntries.map((key) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a
                    key={key}
                    href={settings.social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-black/[0.04] text-[var(--color-primary)] hover:bg-black/[0.08] transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </Container>

      <div className="border-t border-black/[0.08]">
        <Container className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
          <p>{settings.copyrightText}</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-[var(--color-primary)]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-primary)]">
              Terms of Use
            </Link>
            <Link href="/disclaimer" className="hover:text-[var(--color-primary)]">
              Disclaimer
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
