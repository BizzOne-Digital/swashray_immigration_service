import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Container } from "@/components/ui/Container";
import type { ISiteSettings } from "@/lib/models/SiteSettings";
import type { INavigationItem } from "@/lib/models/NavigationItem";
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph, YouTubeGlyph } from "@/components/site/SocialIcons";

const SOCIAL_ICONS = {
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  linkedin: LinkedInGlyph,
  x: XGlyph,
  youtube: YouTubeGlyph,
} as const;

export function Footer({
  settings,
  navigation,
}: {
  settings: ISiteSettings;
  navigation: INavigationItem[];
}) {
  const socialEntries = (Object.keys(SOCIAL_ICONS) as Array<keyof typeof SOCIAL_ICONS>).filter(
    (key) => settings.social?.[key]
  );

  return (
    <footer className="mt-auto relative bg-[#0a1628] text-white">
      {/* hairline gold signature line across the very top of the footer */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent)]/40 to-transparent" aria-hidden="true" />
      <Container className="py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-2">
          <Logo businessName={settings.businessName} logoMediaId={settings.logoMediaId as string | null} light />

          <p className="text-sm text-white/70 max-w-sm leading-relaxed">{settings.footerDescription}</p>
          {socialEntries.length > 0 && (
            <div className="flex gap-3 pt-1">
              {socialEntries.map((key) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a
                    key={key}
                    href={settings.social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-highlight)]" aria-hidden="true" />
            Navigation
          </h3>
          <ul className="space-y-2.5 text-sm">
            {navigation.map((item) => (
              <li key={item.url}>
                <Link href={item.url} className="text-white/80 hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-highlight)]" aria-hidden="true" />
            Contact
          </h3>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                {settings.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:text-white break-all">
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/15">
        <Container className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>{settings.copyrightText}</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Use
            </Link>
            <Link href="/disclaimer" className="hover:text-white">
              Disclaimer
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
