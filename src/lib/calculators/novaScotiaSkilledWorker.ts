/**
 * Nova Scotia Nominee Program — Skilled Worker stream.
 * This stream is assessed against fixed eligibility criteria, not a
 * numeric points grid (confirmed via the official program page), so this
 * tool is an eligibility checklist rather than a score. Based on:
 *   https://liveinnovascotia.com/skilled-worker
 */
import type { CalculatorConfig, CalcResult } from "./types";

export const NOVA_SCOTIA_SKILLED_WORKER_CONFIG: CalculatorConfig = {
  slug: "nova-scotia-pnp",
  title: "Nova Scotia PNP — Skilled Worker",
  authority: "Government of Nova Scotia",
  intro:
    "The Nova Scotia Nominee Program's Skilled Worker stream doesn't use a points grid — applicants either meet all the criteria below or they don't. Check your eligibility here.",
  sourceUrl: "https://liveinnovascotia.com/skilled-worker",
  sourceLabel: "Government of Nova Scotia — Skilled Worker stream",
  disclaimer:
    "This tool checks your profile against Nova Scotia's published Skilled Worker stream eligibility criteria. It is for general information only, is not an official NSNP assessment, and does not guarantee a nomination. Confirm current criteria at liveinnovascotia.com and speak with a licensed consultant before applying.",
  groups: [
    {
      title: "Job Offer",
      fields: [
        {
          key: "hasJobOffer",
          label: "I have a full-time, permanent job offer from a Nova Scotia employer",
          type: "checkbox",
          default: true,
        },
        {
          key: "nocTeer",
          label: "NOC TEER Category of the Job Offer",
          type: "select",
          default: "teer0to3",
          options: [
            { value: "teer0to3", label: "TEER 0, 1, 2, or 3" },
            { value: "teer4to5", label: "TEER 4 or 5" },
          ],
        },
      ],
    },
    {
      title: "Experience & Age",
      fields: [
        {
          key: "relevantExperience",
          label: "I have at least 1 year of experience related to the job (6 months if TEER 4–5, with that employer)",
          type: "checkbox",
          default: true,
        },
        { key: "age", label: "Age", type: "number", default: 29, min: 16, max: 99 },
      ],
    },
    {
      title: "Education & Language",
      fields: [
        {
          key: "highSchoolOrHigher",
          label: "I have at least a high school diploma",
          type: "checkbox",
          default: true,
        },
        {
          key: "clb",
          label: "Canadian Language Benchmark (CLB) Level",
          type: "select",
          default: "clb5plus",
          options: [
            { value: "clb5plus", label: "CLB 5 or higher" },
            { value: "clb4", label: "CLB 4" },
            { value: "below4", label: "Below CLB 4" },
          ],
        },
      ],
    },
    {
      title: "Settlement Funds",
      fields: [
        {
          key: "sufficientFunds",
          label: "I have sufficient funds to settle in Nova Scotia",
          type: "checkbox",
          default: true,
        },
      ],
    },
  ],
  calculate: (input): CalcResult => {
    const age = Number(input.age) || 0;
    const nocTeer = String(input.nocTeer);
    const clb = String(input.clb);
    const requiredClb = nocTeer === "teer4to5" ? "clb4" : "clb5plus";
    const clbRank: Record<string, number> = { below4: 0, clb4: 4, clb5plus: 5 };
    const langOk = clbRank[clb] >= clbRank[requiredClb];

    const checks = [
      { label: "Full-time, permanent Nova Scotia job offer", points: input.hasJobOffer ? 1 : 0 },
      { label: "Age between 21 and 55", points: age >= 21 && age <= 55 ? 1 : 0 },
      { label: "Relevant work experience requirement met", points: input.relevantExperience ? 1 : 0 },
      { label: "At least a high school diploma", points: input.highSchoolOrHigher ? 1 : 0 },
      {
        label: `Language meets ${nocTeer === "teer4to5" ? "CLB 4 (TEER 4–5)" : "CLB 5 (TEER 0–3)"} requirement`,
        points: langOk ? 1 : 0,
      },
      { label: "Sufficient settlement funds", points: input.sufficientFunds ? 1 : 0 },
    ];
    const allMet = checks.every((c) => c.points === 1);

    return {
      mode: "eligibility",
      verdict: allMet ? "Appears to meet Skilled Worker stream criteria" : "Does not yet meet all criteria",
      verdictPositive: allMet,
      sections: [{ title: "Eligibility Checklist", subtotal: checks.filter((c) => c.points).length, items: checks }],
      notes: allMet
        ? []
        : ["Review the criteria above with a licensed consultant — some requirements (like experience years) have exceptions depending on your specific NOC TEER category."],
    };
  },
};
