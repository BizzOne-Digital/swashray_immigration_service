import type { CategoryEntry } from "./types";

export const CATEGORIES: CategoryEntry[] = [
  {
    slug: "temporary-residence",
    title: "Temporary Residence",
    shortDescription: "Visiting, studying, or working in Canada on a temporary basis.",
    icon: "Plane",
    image: "/images/services/temporary-residence.png",
    intro: [
      "Temporary residence covers the pathways that let someone come to Canada for a defined period — to visit family, study, work, or accompany a partner who is doing one of those things.",
      "It includes visitor visas and eTAs, study permits, open and employer-specific work permits, LMIAs for employers, and work permits under trade agreements and youth mobility programs. Each has its own purpose and conditions, so the right starting point depends on what you're trying to do in Canada and for how long.",
    ],
  },
  {
    slug: "permanent-residence",
    title: "Permanent Residence",
    shortDescription: "Federal and provincial pathways toward living in Canada permanently.",
    icon: "Globe2",
    image: "/images/services/permanent-residence.png",
    intro: [
      "Permanent residence pathways are generally built around a person's skills, work experience, and ability to settle economically in Canada, or around a province's specific labour market needs.",
      "Several programs can run in parallel — a candidate is often eligible for more than one, and the right combination depends on the full profile, not a single factor.",
    ],
  },
  {
    slug: "family-sponsorship",
    title: "Family Sponsorship",
    shortDescription: "Reuniting with a spouse, partner, child, parent, or grandparent in Canada.",
    icon: "Users",
    image: "/images/services/family-sponsorship.png",
    intro: [
      "Family sponsorship allows a Canadian citizen or permanent resident to support an eligible relative's application for permanent residence.",
      "The requirements, processing approach, and supporting evidence differ meaningfully depending on the relationship being sponsored.",
    ],
  },
  {
    slug: "citizenship",
    title: "Citizenship",
    shortDescription: "Becoming a Canadian citizen, confirming citizenship, and resolving complex files.",
    icon: "Award",
    image: "/images/services/citizenship.png",
    intro: [
      "Citizenship services cover applying for Canadian citizenship as a permanent resident who meets the requirements, and confirming citizenship status that already exists through birth or descent.",
      "We also help with files that become complicated along the way — residency questionnaires, requests for more information, refusals, and revocation notices.",
    ],
  },
  {
    slug: "irb-representation",
    title: "IRB Representation",
    shortDescription: "Representation before the Immigration and Refugee Board of Canada.",
    icon: "Scale",
    image: "/images/services/irb-representation.png",
    intro: [
      "The Immigration and Refugee Board (IRB) hears several distinct types of matters — refugee protection claims and refugee appeals, admissibility hearings and detention reviews, and appeals of sponsorship refusals, residency obligation decisions, and removal orders.",
      "Each of the IRB's four divisions follows its own procedure and timelines, so preparation looks different depending on which matter applies to your situation. As a licensed RCIC-IRB, we can represent clients before all four divisions.",
    ],
  },
  {
    slug: "other-immigration-services",
    title: "Other Immigration Services",
    shortDescription: "Business immigration, status extensions, refusals, inadmissibility, and other IRCC matters.",
    icon: "ClipboardList",
    image: "/images/services/other-immigration-services.png",
    intro: [
      "Beyond the main temporary and permanent residence streams, a number of other situations come up regularly — maintaining or restoring status, renewing PR documents, responding to IRCC correspondence, or exploring business-based immigration.",
      "This is also where we help with refusal reviews and reconsideration requests, inadmissibility and criminal rehabilitation, risk assessments before removal, private refugee sponsorship and resettlement (including BVOR and community sponsorship), refugee family reunification, and preparing a file for judicial review with a licensed lawyer.",
    ],
  },
];

const SLUG_ALIASES: Record<string, string> = {
  sponsorship: "family-sponsorship",
  "visitor-visa": "temporary-residence",
  "work-permits": "temporary-residence",
  "study-permits": "temporary-residence",
  "passport-services": "other-immigration-services",
};

export function getCategory(slug: string): CategoryEntry | undefined {
  const resolved = SLUG_ALIASES[slug] || slug;
  return CATEGORIES.find((c) => c.slug === resolved);
}
