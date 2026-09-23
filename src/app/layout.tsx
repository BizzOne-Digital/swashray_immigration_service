import type { Metadata } from "next";
import { Inter, Playfair_Display, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

const SITE_NAME = "Swashray Immigration Services Inc.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Canadian Immigration Consultancy | Swashray Immigration Services",
    template: `%s | ${SITE_NAME}`,
  },
  description: "Professional guidance for your immigration journey.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Without JavaScript, ScrollReveal (used for homepage scroll-in
            polish) can never mark elements visible — force them visible so
            content is never hidden for no-JS visitors or crawlers. */}
        <noscript>
          <style>{`.scroll-reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
