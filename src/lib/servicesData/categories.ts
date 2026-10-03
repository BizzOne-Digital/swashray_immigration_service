import type { CategoryEntry } from "./types";

export const CATEGORIES: CategoryEntry[] = [
  {
    slug: "temporary-residence",
    title: "Temporary Residence",
    shortDescription: "Visiting, studying, or working in Canada on a temporary basis.",
    icon: "Plane",
    image: "/images/services/temporary-residence.jpg",
    intro: [
      "Temporary residence covers the pathways that let someone come to Canada for a defined period — to visit family, study, work, or accompany a partner who is doing one of those things.",
      "Each pathway has its own purpose and its own conditions, so the right starting point depends on what you're trying to do in Canada and for how long.",
    ],
  },
  {
    slug: "permanent-residence",
    title: "Permanent Residence",
    shortDescription: "Federal and provincial pathways toward living in Canada permanently.",
    icon: "Globe2",
    image: "/images/services/permanent-residence.jpg",
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
    image: "/images/services/family-sponsorship.jpg",
    intro: [
      "Family sponsorship allows a Canadian citizen or permanent resident to support an eligible relative's application for permanent residence.",
      "The requirements, processing approach, and supporting evidence differ meaningfully depending on the relationship being sponsored.",
    ],
  },
  {
    slug: "citizenship",
    title: "Citizenship",
    shortDescription: "Becoming a Canadian citizen, and confirming citizenship you already hold.",
    icon: "Award",
    image: "/images/services/citizenship.jpg",
    intro: [
      "Citizenship services cover both applying for Canadian citizenship as a permanent resident who meets the requirements, and confirming citizenship status that already exists through birth or descent.",
    ],
  },
  {
    slug: "irb-representation",
    title: "IRB Representation",
    shortDescription: "Representation before the Immigration and Refugee Board of Canada.",
    icon: "Scale",
    image: "/images/services/irb-representation.jpg",
    intro: [
      "The Immigration and Refugee Board (IRB) hears several distinct types of matters, from refugee protection claims to detention reviews and sponsorship appeals.",
      "Each division follows its own procedure and timelines, so preparation looks different depending on which IRB matter applies to your situation.",
    ],
  },
  {
    slug: "other-immigration-services",
    title: "Other Immigration Services",
    shortDescription: "Business immigration, status maintenance, and other IRCC matters.",
    icon: "ClipboardList",
    image: "/images/services/other-immigration-services.jpg",
    intro: [
      "Beyond the main temporary and permanent residence streams, a number of other situations come up regularly — maintaining status, renewing documents, responding to IRCC correspondence, or exploring business-based immigration.",
    ],
  },
];

export function getCategory(slug: string): CategoryEntry | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
