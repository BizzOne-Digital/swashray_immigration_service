import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { MobileNav } from "@/components/site/MobileNav";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { INavigationItem } from "@/lib/models/NavigationItem";

export function Header({
  businessName,
  logoMediaId,
  navigation,
}: {
  businessName: string;
  logoMediaId?: string | null;
  navigation: INavigationItem[];
}) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur border-b border-black/5">
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
        />
      </Container>
    </header>
  );
}
