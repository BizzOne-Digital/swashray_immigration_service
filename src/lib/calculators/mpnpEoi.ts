/**
 * Manitoba Provincial Nominee Program (MPNP) — Expression of Interest (EOI)
 * Ranking System, used across the MPNP Skilled Worker streams.
 * Based on the published points grid:
 *   https://immigratemanitoba.com/wp-content/uploads/2018/02/mpnp-expression-of-interest-ranking-points-grid.pdf
 * Overall maximum: 1,000 points (an unusually wide scale compared to other
 * provinces — Manitoba weights a strong employment connection very heavily).
 *
 * This is a best-effort simplification of a genuinely complex, multi-tier
 * grid (several sub-factors inside "Adaptability" alone run 50–500 points).
 * It is exported once and used by two site entries — "MPNP Expression of
 * Interest" and "Manitoba PNP — Skilled Workers" — since both draw on this
 * same official ranking system.
 */
import type { CalculatorConfig, CalcResult } from "./types";

function languageScore(clb: string): number {
  const table: Record<string, number> = { clb8plus: 25, clb7: 22, clb6: 20, clb5: 17, clb4: 12, below4: 0 };
  return table[clb] ?? 0;
}

function ageScore(age: number): number {
  if (age >= 21 && age <= 45) return 75;
  if (age >= 18 && age < 21) return 30;
  if (age > 45 && age < 50) return 40;
  return 0;
}

function workScore(years: number): number {
  if (years >= 4) return 75;
  if (years >= 2) return 50;
  if (years >= 1) return 25;
  return 0;
}

const EDUCATION_POINTS: Record<string, number> = {
  advancedDegree: 125,
  twoYearProgram: 100,
  tradeOrOneYear: 70,
  none: 0,
};

export function buildMpnpConfig(slug: string, title: string, intro: string): CalculatorConfig {
  return {
    slug,
    title,
    authority: "Government of Manitoba",
    intro,
    sourceUrl: "https://immigratemanitoba.com/wp-content/uploads/2018/02/mpnp-expression-of-interest-ranking-points-grid.pdf",
    sourceLabel: "Government of Manitoba — MPNP EOI Ranking Points Grid",
    disclaimer:
      "This tool is a simplified, best-effort estimate based on Manitoba's published Expression of Interest ranking points grid, which is genuinely complex (several adaptability sub-factors are assessed case-by-case). It is for general information only, is not an official MPNP assessment, and does not guarantee an invitation. Confirm current criteria with Manitoba's immigration office and speak with a licensed consultant before applying.",
    groups: [
      {
        title: "Language Proficiency",
        fields: [
          {
            key: "firstLangClb",
            label: "First Official Language (CLB)",
            type: "select",
            default: "clb7",
            options: [
              { value: "clb8plus", label: "CLB 8 or higher" },
              { value: "clb7", label: "CLB 7" },
              { value: "clb6", label: "CLB 6" },
              { value: "clb5", label: "CLB 5" },
              { value: "clb4", label: "CLB 4" },
              { value: "below4", label: "Below CLB 4" },
            ],
          },
          {
            key: "secondLangClb5plus",
            label: "Second official language at CLB 5+ (all abilities)",
            type: "checkbox",
            default: false,
          },
        ],
      },
      {
        title: "Age & Work Experience",
        fields: [
          { key: "age", label: "Age", type: "number", default: 29, min: 17, max: 99 },
          { key: "workYears", label: "Years of Skilled Work Experience", type: "number", default: 2, min: 0, max: 20 },
          {
            key: "licensedOccupation",
            label: "My occupation is licensed/regulated in Manitoba and I meet requirements",
            type: "checkbox",
            default: false,
          },
        ],
      },
      {
        title: "Education",
        fields: [
          {
            key: "education",
            label: "Highest Level of Education",
            type: "select",
            default: "twoYearProgram",
            options: [
              { value: "advancedDegree", label: "Advanced degree (master's/doctorate)" },
              { value: "twoYearProgram", label: "Post-secondary program, 2+ years" },
              { value: "tradeOrOneYear", label: "Trade certificate or 1-year program" },
              { value: "none", label: "No formal post-secondary education" },
            ],
          },
        ],
      },
      {
        title: "Manitoba Connection & Adaptability",
        fields: [
          {
            key: "manitobaJobOffer",
            label: "I have an ongoing job offer in Manitoba (6+ months, long-term)",
            type: "checkbox",
            default: false,
          },
          {
            key: "familyTies",
            label: "I have close family or prior study/work ties to Manitoba",
            type: "checkbox",
            default: false,
          },
          {
            key: "regionalDestination",
            label: "I intend to settle outside Winnipeg (regional Manitoba)",
            type: "checkbox",
            default: false,
          },
          {
            key: "outOfProvinceExperience",
            label: "I have work or study experience in another Canadian province (risk factor)",
            type: "checkbox",
            default: false,
          },
        ],
      },
    ],
    calculate: (input): CalcResult => {
      const langTotal = Math.min(125, languageScore(String(input.firstLangClb)) + (input.secondLangClb5plus ? 25 : 0));
      const ageTotal = ageScore(Number(input.age) || 0);
      const workBase = workScore(Number(input.workYears) || 0);
      const workTotal = Math.min(175, workBase + (input.licensedOccupation ? 100 : 0));
      const eduTotal = EDUCATION_POINTS[String(input.education)] ?? 0;

      let adaptability = 0;
      const adaptItems: { label: string; points: number }[] = [];
      if (input.manitobaJobOffer) { adaptability += 500; adaptItems.push({ label: "Ongoing Manitoba job offer", points: 500 }); }
      if (input.familyTies) { adaptability += 200; adaptItems.push({ label: "Family / prior Manitoba ties", points: 200 }); }
      if (input.regionalDestination) { adaptability += 50; adaptItems.push({ label: "Regional (outside Winnipeg) destination", points: 50 }); }
      adaptability = Math.min(500, adaptability);

      let riskDeduction = 0;
      if (input.outOfProvinceExperience) riskDeduction = 100;

      const total = Math.max(0, langTotal + ageTotal + workTotal + eduTotal + adaptability - riskDeduction);

      const sections = [
        { title: "Language Proficiency", subtotal: langTotal, items: [{ label: "First + second official language", points: langTotal }] },
        { title: "Age", subtotal: ageTotal, items: [{ label: `Age ${input.age}`, points: ageTotal }] },
        { title: "Work Experience", subtotal: workTotal, items: [{ label: "Years of experience + licensing", points: workTotal }] },
        { title: "Education", subtotal: eduTotal, items: [{ label: "Highest credential", points: eduTotal }] },
        {
          title: "Manitoba Connection & Adaptability",
          subtotal: adaptability,
          items: adaptItems.length ? adaptItems : [{ label: "No connection factors selected", points: 0 }],
        },
      ];
      if (riskDeduction > 0) {
        sections.push({ title: "Risk Assessment", subtotal: -riskDeduction, items: [{ label: "Out-of-province work/study experience", points: -riskDeduction }] });
      }

      return {
        mode: "score",
        total,
        maxPossible: 1000,
        sections,
        notes: [
          "Manitoba's real EOI grid has additional sub-factors (strategic recruitment initiatives, specific occupational demand, etc.) assessed case-by-case that this simplified tool does not capture.",
        ],
      };
    },
  };
}

export const MPNP_EOI_CONFIG = buildMpnpConfig(
  "mpnp-eoi",
  "MPNP Expression of Interest",
  "Estimate your score under Manitoba's Expression of Interest Ranking System, used to invite candidates to apply to the Manitoba Provincial Nominee Program's skilled worker streams."
);

export const MANITOBA_PNP_CONFIG = buildMpnpConfig(
  "manitoba-pnp",
  "Manitoba PNP — Skilled Workers",
  "Manitoba's Skilled Worker streams (in Manitoba and Overseas) are ranked using the same Expression of Interest system — estimate your score below."
);
