/**
 * Canadian immigration point-calculator directory shown on /calculators.
 *
 * Every entry below is now a real, interactive calculator built and hosted
 * on Swashray's own site (internal: true) — no card sends visitors to a
 * third-party or government page to get their result. The CRS tool has its
 * own hand-built page at /calculator and the OINP tool at /calculators/oinp;
 * the other nine are rendered from a shared engine at /calculators/[slug]
 * (see src/lib/calculators/registry.ts). The same list, in this order, fills
 * the header's Calculators menu (using each entry's navLabel).
 *
 * The underlying scoring logic for each one is built from that program's
 * official published point grid or eligibility criteria (sources are cited
 * inside each calculator's result panel and in src/lib/calculators/*.ts).
 * Four programs (BC PNP, Nova Scotia, Saskatchewan's exact sub-weights, and
 * Manitoba's EOI grid) don't publish a fully complete public formula, so
 * those tools are clearly flagged as best-effort estimates — see each
 * calculator's own disclaimer and the comments in its source file.
 *
 * Verify these figures periodically — government point grids are revised
 * from time to time.
 */
export interface CalculatorEntry {
  slug: string;
  title: string;
  /** Short name for the header's Calculators menu. */
  navLabel: string;
  authority: string;
  description: string;
  href: string;
  internal: boolean;
  icon: string;
}

export const CALCULATORS: CalculatorEntry[] = [
  {
    slug: "crs",
    title: "Express Entry CRS Calculator",
    navLabel: "CRS Calculator",
    authority: "Swashray Immigration Services",
    description:
      "Our own in-house tool — estimate your Comprehensive Ranking System score using the official IRCC point tables.",
    href: "/calculator",
    internal: true,
    icon: "Award",
  },
  {
    slug: "oinp",
    title: "OINP Workforce Priority Stream",
    navLabel: "OINP Calculator",
    authority: "Government of Ontario",
    description:
      "Estimate your Expression of Interest points for the Ontario Immigrant Nominee Program's Ontario Workforce Priority stream.",
    href: "/calculators/oinp",
    internal: true,
    icon: "Building2",
  },
  {
    slug: "fsw-67",
    title: "Federal Skilled Worker (67 Points)",
    navLabel: "FSW Calculator",
    authority: "Government of Canada — IRCC",
    description:
      "Calculate your score against the six selection factors used to assess eligibility for the Federal Skilled Worker Program.",
    href: "/calculators/fsw-67",
    internal: true,
    icon: "Briefcase",
  },
  {
    slug: "bc-pnp",
    title: "BC PNP Skills Immigration",
    navLabel: "BC PNP Calculator",
    authority: "WelcomeBC — Government of British Columbia",
    description:
      "Estimate your Skills Immigration Registration System (SIRS) score for the BC Provincial Nominee Program.",
    href: "/calculators/bc-pnp",
    internal: true,
    icon: "Mountain",
  },
  {
    slug: "nova-scotia-pnp",
    title: "Nova Scotia PNP — Skilled Worker",
    navLabel: "Nova Scotia PNP",
    authority: "Government of Nova Scotia",
    description:
      "Check your eligibility against the Nova Scotia Nominee Program's Skilled Worker stream criteria.",
    href: "/calculators/nova-scotia-pnp",
    internal: true,
    icon: "Landmark",
  },
  {
    slug: "sinp",
    title: "SINP International Skilled Worker",
    navLabel: "SINP Calculator",
    authority: "Government of Saskatchewan",
    description:
      "Calculate your Expression of Interest (EOI) score for the Saskatchewan Immigrant Nominee Program.",
    href: "/calculators/sinp",
    internal: true,
    icon: "Globe2",
  },
  {
    slug: "super-visa",
    title: "Super Visa Eligibility",
    navLabel: "Super Visa Eligibility",
    authority: "Government of Canada — IRCC",
    description:
      "Check your household income against the LICO threshold and the other core Super Visa requirements.",
    href: "/calculators/super-visa",
    internal: true,
    icon: "HeartHandshake",
  },
  {
    slug: "rnip-west-kootenay",
    title: "RNIP — West Kootenay",
    navLabel: "RNIP West Kootenay",
    authority: "West Kootenay Rural Community Immigration Pilot",
    description:
      "Calculate your score against the West Kootenay community's Rural Community Immigration Pilot scoring grid.",
    href: "/calculators/rnip-west-kootenay",
    internal: true,
    icon: "TreePine",
  },
  {
    slug: "mpnp-eoi",
    title: "MPNP Expression of Interest",
    navLabel: "MPNP EOI Calculator",
    authority: "Government of Manitoba",
    description:
      "Estimate your score under Manitoba's Expression of Interest ranking system for skilled worker streams.",
    href: "/calculators/mpnp-eoi",
    internal: true,
    icon: "ClipboardList",
  },
  {
    slug: "manitoba-pnp",
    title: "Manitoba PNP — Skilled Workers",
    navLabel: "Manitoba PNP Calculator",
    authority: "Government of Manitoba",
    description:
      "The same Expression of Interest ranking system, for Manitoba's in-province and overseas skilled worker streams.",
    href: "/calculators/manitoba-pnp",
    internal: true,
    icon: "FileCheck",
  },
  {
    slug: "alberta-aaip",
    title: "Alberta AAIP Worker Stream",
    navLabel: "Alberta AAIP Calculator",
    authority: "Government of Alberta",
    description:
      "Calculate your score against the Alberta Advantage Immigration Program's worker stream points grid.",
    href: "/calculators/alberta-aaip",
    internal: true,
    icon: "Compass",
  },
];
