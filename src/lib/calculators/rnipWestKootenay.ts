/**
 * Rural and Northern Immigration Pilot — West Kootenay community
 * (now operating as the Rural Community Immigration Pilot, RCIP).
 * Based on the community's published scoring grid:
 *   https://westkootenayimmigration.ca/
 * Five factors, 25 points each, 125 total. A candidate needs at least
 * 50 points overall AND a minimum of 10 points in every one of the five
 * factors to meet the community's recommendation threshold.
 */
import type { CalculatorConfig, CalcResult } from "./types";

export const RNIP_WEST_KOOTENAY_CONFIG: CalculatorConfig = {
  slug: "rnip-west-kootenay",
  title: "RNIP — West Kootenay",
  authority: "West Kootenay Rural Community Immigration Pilot",
  intro:
    "Estimate your score against the West Kootenay community's Rural Community Immigration Pilot (formerly RNIP) scoring grid. A recommendation typically requires 50+ points overall, with at least 10 points in each of the five factors below.",
  sourceUrl: "https://westkootenayimmigration.ca/",
  sourceLabel: "West Kootenay Rural Community Immigration Pilot — scoring grid",
  disclaimer:
    "This tool estimates your score using the West Kootenay community's published scoring grid (job offer, work experience, language, education, and intent to reside — 25 points each, 125 total). It is for general information only, is not an official community assessment, and does not guarantee a community recommendation. Confirm current criteria with the community partner organization and speak with a licensed consultant before applying.",
  groups: [
    {
      title: "Job Offer",
      fields: [
        {
          key: "jobOffer",
          label: "Job Offer Quality",
          type: "select",
          default: "qualifying",
          options: [
            { value: "qualifying", label: "Valid, qualifying job offer from a West Kootenay employer" },
            { value: "partial", label: "Offer in progress / partially meets requirements" },
            { value: "none", label: "No job offer yet" },
          ],
        },
      ],
    },
    {
      title: "Work Experience",
      fields: [
        { key: "workYears", label: "Years of Relevant Work Experience", type: "number", default: 2, min: 0, max: 10 },
      ],
    },
    {
      title: "Language",
      fields: [
        {
          key: "clb",
          label: "Canadian Language Benchmark (CLB) Level",
          type: "select",
          default: "clb6plus",
          options: [
            { value: "clb6plus", label: "CLB 6 or higher" },
            { value: "clb5", label: "CLB 5" },
            { value: "clb4", label: "CLB 4" },
            { value: "below4", label: "Below CLB 4" },
          ],
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
          default: "postSecondary",
          options: [
            { value: "postSecondary", label: "Post-secondary credential (certificate, diploma or degree)" },
            { value: "highSchool", label: "High school diploma" },
            { value: "less", label: "Less than high school" },
          ],
        },
      ],
    },
    {
      title: "Intent to Reside",
      fields: [
        {
          key: "intentToReside",
          label: "Strength of Your Intent to Reside in the West Kootenay Region",
          type: "select",
          default: "strong",
          options: [
            { value: "strong", label: "Strong — ties, visits, or prior connection to the region" },
            { value: "moderate", label: "Moderate — general interest, limited prior connection" },
            { value: "weak", label: "Weak — no prior connection" },
          ],
        },
      ],
    },
  ],
  calculate: (input): CalcResult => {
    const jobOfferPoints = { qualifying: 25, partial: 12, none: 0 }[String(input.jobOffer)] ?? 0;

    const years = Number(input.workYears) || 0;
    const workPoints = years >= 5 ? 25 : years >= 3 ? 20 : years >= 1 ? 12 : 0;

    const langPoints = { clb6plus: 25, clb5: 18, clb4: 10, below4: 0 }[String(input.clb)] ?? 0;

    const eduPoints = { postSecondary: 25, highSchool: 12, less: 0 }[String(input.education)] ?? 0;

    const intentPoints = { strong: 25, moderate: 14, weak: 0 }[String(input.intentToReside)] ?? 0;

    const total = jobOfferPoints + workPoints + langPoints + eduPoints + intentPoints;
    const factors = [
      { label: "Job Offer", points: jobOfferPoints },
      { label: "Work Experience", points: workPoints },
      { label: "Language", points: langPoints },
      { label: "Education", points: eduPoints },
      { label: "Intent to Reside", points: intentPoints },
    ];
    const belowMinimum = factors.filter((f) => f.points < 10).map((f) => f.label);
    const meetsFactorMinimums = belowMinimum.length === 0;
    const meetsOverall = total >= 50;
    const meetsThreshold = meetsOverall && meetsFactorMinimums;

    const notes: string[] = [];
    if (!meetsFactorMinimums) {
      notes.push(`You scored below the 10-point minimum in: ${belowMinimum.join(", ")}. Every factor needs at least 10 points, regardless of your overall total.`);
    }

    return {
      mode: "score",
      total,
      maxPossible: 125,
      passMark: 50,
      verdict: meetsThreshold ? "Meets the community's scoring threshold" : "Does not currently meet the threshold",
      verdictPositive: meetsThreshold,
      sections: [{ title: "Scoring Factors (25 points each)", subtotal: total, items: factors }],
      notes,
    };
  },
};
