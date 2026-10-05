/**
 * BC PNP Skills Immigration Registration System (SIRS) — best-effort
 * reconstruction. WelcomeBC confirms the scoring CATEGORIES (skill level
 * and wage of the job offer, regional location, work experience, education,
 * language) but does not publish the full numeric grid publicly; the figures
 * below are commonly-cited approximations of BC's SIRS weighting (max 200:
 * Economic Factors 120 + Human Capital Factors 80). Flagged with a stronger
 * accuracy disclaimer than the other calculators for this reason.
 */
import type { CalculatorConfig, CalcResult } from "./types";

function wagePoints(hourly: number): number {
  if (hourly >= 48) return 50;
  if (hourly >= 38) return 40;
  if (hourly >= 29) return 30;
  if (hourly >= 20) return 20;
  if (hourly >= 12) return 10;
  return 0;
}

export const BC_PNP_CONFIG: CalculatorConfig = {
  slug: "bc-pnp",
  title: "BC PNP Skills Immigration (SIRS)",
  authority: "WelcomeBC — Government of British Columbia",
  intro:
    "Estimate your Skills Immigration Registration System (SIRS) score out of an approximate 200-point scale, combining the economic factors of your B.C. job offer with your human capital.",
  sourceUrl: "https://www.welcomebc.ca/immigrate-to-b-c/skills-immigration",
  sourceLabel: "WelcomeBC — Skills Immigration",
  disclaimer:
    "British Columbia does not publish its complete SIRS scoring formula — WelcomeBC confirms the scoring categories (job skill level, wage, regional location, work experience, education, and language) but not every exact point value. This tool uses commonly-published approximations of that weighting and should be treated as a rough, directional estimate only, not an official BC PNP score. Confirm your registration score only through an actual SIRS registration, and speak with a licensed consultant before applying.",
  groups: [
    {
      title: "Your B.C. Job Offer",
      fields: [
        {
          key: "occupationSkill",
          label: "Occupation / Skill Level",
          type: "select",
          default: "skilled",
          options: [
            { value: "nocZero", label: "NOC \"00\" senior management occupation" },
            { value: "highDemand", label: "On B.C.'s High Demand Occupations List" },
            { value: "skilled", label: "Other skilled occupation (TEER 0–3)" },
          ],
        },
        { key: "hourlyWage", label: "Hourly Wage Offered (CAD $)", type: "number", default: 32, min: 12, max: 100 },
        {
          key: "regionalBc",
          label: "Job is located outside Metro Vancouver",
          type: "checkbox",
          default: false,
        },
        {
          key: "alreadyWorkingForEmployer",
          label: "I am already working for this B.C. employer under a valid work permit",
          type: "checkbox",
          default: false,
        },
      ],
    },
    {
      title: "Work Experience",
      fields: [
        { key: "workMonths", label: "Months of Experience in the Occupation", type: "number", default: 24, min: 0, max: 240 },
        {
          key: "canadianWorkExperience",
          label: "I have at least 1 year of Canadian work experience",
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
          default: "bachelors",
          options: [
            { value: "masterOrDoctoral", label: "Master's or doctoral degree" },
            { value: "bachelors", label: "Bachelor's degree" },
            { value: "diploma", label: "Diploma or certificate (1–2 years)" },
            { value: "highSchool", label: "High school" },
          ],
        },
        {
          key: "credentialInCanada",
          label: "Credential earned in B.C. or Canada",
          type: "checkbox",
          default: false,
        },
      ],
    },
    {
      title: "Language",
      fields: [
        {
          key: "clb",
          label: "Canadian Language Benchmark (CLB) Level",
          type: "select",
          default: "clb6to7",
          options: [
            { value: "clb10plus", label: "CLB 10 or higher" },
            { value: "clb8to9", label: "CLB 8–9" },
            { value: "clb6to7", label: "CLB 6–7" },
            { value: "clb4to5", label: "CLB 4–5" },
            { value: "below4", label: "Below CLB 4 / no test" },
          ],
        },
      ],
    },
  ],
  calculate: (input): CalcResult => {
    const skillBase = { nocZero: 15, highDemand: 10, skilled: 0 }[String(input.occupationSkill)] ?? 0;
    const employerBonus = input.alreadyWorkingForEmployer ? 10 : 0;
    const skillTotal = Math.min(60, 35 + skillBase + employerBonus);

    const wageTotal = wagePoints(Number(input.hourlyWage) || 0);
    const regionalTotal = input.regionalBc ? 10 : 0;
    const economicTotal = Math.min(120, skillTotal + wageTotal + regionalTotal);

    const months = Number(input.workMonths) || 0;
    const workBase = months >= 60 ? 15 : months >= 36 ? 11 : months >= 12 ? 7 : months > 0 ? 3 : 0;
    const workBonus = input.canadianWorkExperience ? 10 : 0;
    const workTotal = Math.min(25, workBase + workBonus);

    const eduBase = { masterOrDoctoral: 17, bachelors: 15, diploma: 10, highSchool: 0 }[String(input.education)] ?? 0;
    const eduBonus = input.credentialInCanada ? 8 : 0;
    const eduTotal = Math.min(25, eduBase + eduBonus);

    const langTotal = { clb10plus: 30, clb8to9: 24, clb6to7: 16, clb4to5: 8, below4: 0 }[String(input.clb)] ?? 0;

    const humanCapitalTotal = Math.min(80, workTotal + eduTotal + langTotal);
    const total = economicTotal + humanCapitalTotal;

    return {
      mode: "score",
      total,
      maxPossible: 200,
      sections: [
        {
          title: "Economic Factors (job offer)",
          subtotal: economicTotal,
          items: [
            { label: "Skill level of job offer", points: skillTotal },
            { label: "Wage of job offer", points: wageTotal },
            { label: "Regional location", points: regionalTotal },
          ],
        },
        {
          title: "Human Capital Factors",
          subtotal: humanCapitalTotal,
          items: [
            { label: "Work experience", points: workTotal },
            { label: "Education", points: eduTotal },
            { label: "Language", points: langTotal },
          ],
        },
      ],
      notes: ["BC PNP invites registrants by draw cut-off score, which varies by category and changes regularly — there is no fixed pass mark."],
    };
  },
};
