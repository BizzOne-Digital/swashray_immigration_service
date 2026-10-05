/**
 * Alberta Advantage Immigration Program (AAIP) — Worker stream Expression
 * of Interest points grid. Based on the published grid:
 *   https://www.alberta.ca/system/files/im-worker-stream-expression-of-interest-points-grid.pdf
 * Overall maximum: 100 points (Human Capital 69 + Economic 31).
 */
import type { CalculatorConfig, CalcResult } from "./types";

const EDUCATION_LEVEL_POINTS: Record<string, number> = {
  doctorate: 12,
  masters: 10,
  bachelorsOrTrades: 7,
  certificate: 4,
  secondaryOrLess: 0,
};

const LANGUAGE_GENERAL_POINTS: Record<string, number> = { clb8plus: 10, clb6to7: 7, clb4to5: 4, below4: 0 };

function workGlobalPoints(months: number): number {
  if (months >= 12) return 11;
  if (months >= 6) return 7;
  if (months > 0) return 3;
  return 0;
}

function ageScore(age: number): number {
  if (age >= 21 && age <= 34) return 5;
  if ((age >= 18 && age < 21) || (age > 34 && age <= 45)) return 4;
  if (age > 45 && age <= 55) return 3;
  return 0;
}

export const ALBERTA_AAIP_CONFIG: CalculatorConfig = {
  slug: "alberta-aaip",
  title: "Alberta AAIP Worker Stream",
  authority: "Government of Alberta",
  intro:
    "Estimate your score against the Alberta Advantage Immigration Program's worker stream Expression of Interest points grid, out of a maximum of 100 points.",
  sourceUrl: "https://www.alberta.ca/system/files/im-worker-stream-expression-of-interest-points-grid.pdf",
  sourceLabel: "Government of Alberta — AAIP Worker Stream EOI Points Grid",
  disclaimer:
    "This tool estimates your Alberta Advantage Immigration Program worker-stream EOI score using the province's published points grid. It is for general information only, is not an official AAIP assessment, and does not guarantee an invitation to apply. Confirm current criteria using Alberta's own AAIP Eligibility Explorer and speak with a licensed consultant before applying.",
  groups: [
    {
      title: "Education",
      fields: [
        {
          key: "educationLevel",
          label: "Highest Level of Education Completed",
          type: "select",
          default: "bachelorsOrTrades",
          options: [
            { value: "doctorate", label: "Doctorate" },
            { value: "masters", label: "Master's degree" },
            { value: "bachelorsOrTrades", label: "Bachelor's degree, trades certification, or diploma" },
            { value: "certificate", label: "Certificate (less than 1 year)" },
            { value: "secondaryOrLess", label: "Secondary school or lower" },
          ],
        },
        {
          key: "educationInAlberta",
          label: "Credential obtained in Alberta",
          type: "checkbox",
          default: false,
          help: "Unchecked counts as obtained elsewhere in Canada (6 points) or outside Canada (0 points) — assumed elsewhere in Canada here.",
        },
      ],
    },
    {
      title: "Language",
      fields: [
        {
          key: "languageClb",
          label: "General Language Proficiency (CLB/NCLC)",
          type: "select",
          default: "clb6to7",
          options: [
            { value: "clb8plus", label: "CLB 8 or higher" },
            { value: "clb6to7", label: "CLB 6–7" },
            { value: "clb4to5", label: "CLB 4–5" },
            { value: "below4", label: "Below CLB 4" },
          ],
        },
        {
          key: "bilingual",
          label: "Bilingual — CLB/NCLC 4+ in both English and French",
          type: "checkbox",
          default: false,
        },
      ],
    },
    {
      title: "Work Experience",
      fields: [
        { key: "globalExperienceMonths", label: "Total Work Experience (months, anywhere)", type: "number", default: 24, min: 0, max: 600 },
        {
          key: "canadianExperience",
          label: "Recent Canadian Work Experience (6+ months)",
          type: "select",
          default: "none",
          options: [
            { value: "alberta", label: "In Alberta" },
            { value: "otherProvince", label: "In another Canadian province" },
            { value: "none", label: "None" },
          ],
        },
      ],
    },
    {
      title: "Age, Family & Job Offer",
      fields: [
        { key: "age", label: "Age", type: "number", default: 29, min: 17, max: 99 },
        {
          key: "familyInAlberta",
          label: "I have a parent, child, or sibling who is a Canadian citizen/PR living in Alberta",
          type: "checkbox",
          default: false,
        },
        {
          key: "albertaJobOffer",
          label: "I have a permanent, full-time job offer from an Alberta employer",
          type: "checkbox",
          default: false,
        },
        {
          key: "regulatedWithCertification",
          label: "My occupation is regulated and I hold the required Alberta certification",
          type: "checkbox",
          default: false,
        },
      ],
    },
  ],
  calculate: (input): CalcResult => {
    const eduBase = EDUCATION_LEVEL_POINTS[String(input.educationLevel)] ?? 0;
    const eduLocation = input.educationInAlberta ? 10 : 6;
    const educationTotal = Math.min(22, eduBase + eduLocation);

    const langGeneral = LANGUAGE_GENERAL_POINTS[String(input.languageClb)] ?? 0;
    const bilingual = input.bilingual ? 3 : 0;
    const languageTotal = Math.min(13, langGeneral + bilingual);

    const globalWork = workGlobalPoints(Number(input.globalExperienceMonths) || 0);
    const canadianWork = { alberta: 10, otherProvince: 6, none: 0 }[String(input.canadianExperience)] ?? 0;
    const workTotal = Math.min(21, globalWork + canadianWork);

    const ageTotal = ageScore(Number(input.age) || 0);
    const familyTotal = input.familyInAlberta ? 8 : 0;
    const humanCapitalTotal = educationTotal + languageTotal + workTotal + ageTotal + familyTotal;

    let jobOfferTotal = 0;
    const jobItems: { label: string; points: number }[] = [];
    if (input.albertaJobOffer) { jobOfferTotal += 10; jobItems.push({ label: "Permanent full-time Alberta job offer", points: 10 }); }
    if (input.regulatedWithCertification) { jobOfferTotal += 6; jobItems.push({ label: "Regulated occupation with Alberta certification", points: 6 }); }
    jobOfferTotal = Math.min(16, jobOfferTotal);

    const total = humanCapitalTotal + jobOfferTotal;

    return {
      mode: "score",
      total,
      maxPossible: 100,
      sections: [
        {
          title: "Human Capital Factors",
          subtotal: humanCapitalTotal,
          items: [
            { label: "Education", points: educationTotal },
            { label: "Language", points: languageTotal },
            { label: "Work experience", points: workTotal },
            { label: "Age", points: ageTotal },
            { label: "Family connection in Alberta", points: familyTotal },
          ],
        },
        {
          title: "Economic Factors",
          subtotal: jobOfferTotal,
          items: jobItems.length ? jobItems : [{ label: "No job-offer factors selected", points: 0 }],
        },
      ],
    };
  },
};
