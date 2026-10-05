/**
 * Saskatchewan Immigrant Nominee Program (SINP) — International Skilled
 * Worker Expression of Interest (EOI) points assessment.
 * Based on the published SINP point assessment grid:
 *   https://www.saskatchewan.ca/.../assess-your-eligibility
 * Overall maximum: 110 points (Labour Market Success 80 + Saskatchewan
 * Connection & Adaptability 30). SINP does not publish a fixed minimum
 * score — EOI profiles are ranked and drawn from highest score down.
 */
import type { CalculatorConfig, CalcResult } from "./types";

const EDUCATION_POINTS: Record<string, number> = {
  masterOrDoctorate: 23,
  bachelors: 20,
  tradeCertification: 20,
  twoYearDiploma: 15,
  certificate: 12,
  none: 0,
};

const CLB_FIRST: Record<string, number> = { clb8plus: 20, clb7: 18, clb6: 16, clb5: 14, clb4: 12, none: 0 };
const CLB_SECOND: Record<string, number> = { clb8plus: 10, clb7: 8, clb6: 6, clb5: 4, clb4: 2, none: 0 };

function ageScore(age: number): number {
  if (age < 18) return 0;
  if (age <= 21) return 8;
  if (age <= 34) return 12;
  if (age <= 45) return 10;
  if (age <= 50) return 8;
  return 0;
}

function recentWorkScore(years: number): number {
  return { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 }[Math.min(5, Math.max(0, Math.round(years)))] ?? 0;
}
function priorWorkScore(years: number): number {
  return { 0: 0, 1: 0, 2: 2, 3: 3, 4: 4, 5: 5 }[Math.min(5, Math.max(0, Math.round(years)))] ?? 0;
}

export const SINP_CONFIG: CalculatorConfig = {
  slug: "sinp",
  title: "SINP International Skilled Worker",
  authority: "Government of Saskatchewan",
  intro:
    "Estimate your Expression of Interest (EOI) score for the Saskatchewan Immigrant Nominee Program's International Skilled Worker category. SINP draws EOI profiles from highest score to lowest, rather than using a fixed pass mark.",
  sourceUrl:
    "https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program/assess-your-eligibility",
  sourceLabel: "Government of Saskatchewan — SINP point assessment grid",
  disclaimer:
    "This tool estimates your SINP International Skilled Worker EOI score using the province's published point assessment grid. It is for general information only, is not an official SINP assessment, and EOI invitations depend on draw cut-offs that change over time. Confirm current criteria with Saskatchewan.ca and speak with a licensed consultant before applying.",
  groups: [
    {
      title: "Education & Training",
      fields: [
        {
          key: "education",
          label: "Highest Education / Training",
          type: "select",
          default: "bachelors",
          options: [
            { value: "masterOrDoctorate", label: "Master's or Doctorate (Canadian equivalency)" },
            { value: "bachelors", label: "Bachelor's degree or 3+ year university/college program" },
            { value: "tradeCertification", label: "Trade certification (journeyperson, SK-recognized)" },
            { value: "twoYearDiploma", label: "2-year post-secondary diploma" },
            { value: "certificate", label: "Certificate or 2-semester program" },
            { value: "none", label: "None of the above" },
          ],
        },
      ],
    },
    {
      title: "Skilled Work Experience",
      fields: [
        { key: "recentWorkYears", label: "Years of Related Work Experience (past 5 years)", type: "number", default: 2, min: 0, max: 5 },
        { key: "priorWorkYears", label: "Additional Years of Related Experience (6–10 years prior)", type: "number", default: 0, min: 0, max: 5 },
      ],
    },
    {
      title: "Language Ability",
      fields: [
        {
          key: "firstLangClb",
          label: "First Language Test (CLB)",
          type: "select",
          default: "clb8plus",
          options: [
            { value: "clb8plus", label: "CLB 8 or higher" },
            { value: "clb7", label: "CLB 7" },
            { value: "clb6", label: "CLB 6" },
            { value: "clb5", label: "CLB 5" },
            { value: "clb4", label: "CLB 4" },
            { value: "none", label: "No test taken" },
          ],
        },
        {
          key: "secondLangClb",
          label: "Second Language Test (CLB)",
          type: "select",
          default: "none",
          options: [
            { value: "clb8plus", label: "CLB 8 or higher" },
            { value: "clb7", label: "CLB 7" },
            { value: "clb6", label: "CLB 6" },
            { value: "clb5", label: "CLB 5" },
            { value: "clb4", label: "CLB 4" },
            { value: "none", label: "Not applicable" },
          ],
        },
      ],
    },
    {
      title: "Age",
      fields: [{ key: "age", label: "Age", type: "number", default: 29, min: 17, max: 99 }],
    },
    {
      title: "Saskatchewan Connection & Adaptability",
      fields: [
        {
          key: "jobOffer",
          label: "I have a high-skilled employment offer from a Saskatchewan employer",
          type: "checkbox",
          default: false,
        },
        {
          key: "closeRelative",
          label: "I have a close family relative (citizen/PR) living in Saskatchewan",
          type: "checkbox",
          default: false,
        },
        {
          key: "pastWorkSask",
          label: "I have 12+ months of past work experience in Saskatchewan",
          type: "checkbox",
          default: false,
        },
        {
          key: "pastStudySask",
          label: "I completed 1+ full academic year of study in Saskatchewan",
          type: "checkbox",
          default: false,
        },
      ],
    },
  ],
  calculate: (input): CalcResult => {
    const educationTotal = EDUCATION_POINTS[String(input.education)] ?? 0;
    const workTotal = recentWorkScore(Number(input.recentWorkYears) || 0) + priorWorkScore(Number(input.priorWorkYears) || 0);
    const langTotal = (CLB_FIRST[String(input.firstLangClb)] ?? 0) + (CLB_SECOND[String(input.secondLangClb)] ?? 0);
    const ageTotal = ageScore(Number(input.age) || 0);
    const labourMarketTotal = Math.min(80, educationTotal + workTotal + langTotal + ageTotal);

    let connection = 0;
    const connectionItems: { label: string; points: number }[] = [];
    if (input.jobOffer) { connection += 30; connectionItems.push({ label: "Saskatchewan high-skilled job offer", points: 30 }); }
    else {
      if (input.closeRelative) { connection += 20; connectionItems.push({ label: "Close relative in Saskatchewan", points: 20 }); }
      if (input.pastWorkSask) { connection += 5; connectionItems.push({ label: "Past Saskatchewan work experience", points: 5 }); }
      if (input.pastStudySask) { connection += 5; connectionItems.push({ label: "Past Saskatchewan study", points: 5 }); }
    }
    connection = Math.min(30, connection);

    const total = labourMarketTotal + connection;

    return {
      mode: "score",
      total,
      maxPossible: 110,
      sections: [
        {
          title: "Labour Market Success",
          subtotal: labourMarketTotal,
          items: [
            { label: "Education / training", points: educationTotal },
            { label: "Skilled work experience", points: workTotal },
            { label: "Language ability", points: langTotal },
            { label: "Age", points: ageTotal },
          ],
        },
        {
          title: "Saskatchewan Connection & Adaptability",
          subtotal: connection,
          items: connectionItems.length ? connectionItems : [{ label: "No connection factors selected", points: 0 }],
        },
      ],
      notes: [
        "SINP does not publish a fixed minimum EOI score — profiles are ranked and invited from highest score down, so a higher score improves your relative standing rather than guaranteeing an invitation.",
      ],
    };
  },
};
