/**
 * Federal Skilled Worker Program (FSW) — 67-point selection grid.
 * Mirrors the official IRCC point tables at:
 *   https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers/six-selection-factors-federal-skilled-workers.html
 * Pass mark: 67 out of 100.
 */
import type { CalculatorConfig, CalcResult } from "./types";

const EDUCATION_POINTS: Record<string, number> = {
  doctoral: 25,
  masters: 23,
  twoOrMore: 22,
  threeYearPlus: 21,
  twoYear: 19,
  oneYear: 15,
  highSchool: 5,
  lessThanHighSchool: 0,
};

// Official table awards points PER ABILITY (speaking/listening/reading/
// writing), each capped at these values — since the field asks for a single
// CLB level "across all 4 abilities", the total for first language is this
// per-ability value × 4 (max 24 of the 28-point language total).
const CLB_FIRST_LANG_PER_ABILITY: Record<string, number> = {
  clb9plus: 6,
  clb8: 5,
  clb7: 4,
  below7: 0,
};

function ageScore(age: number): number {
  if (age < 18 || age > 47) return 0;
  if (age >= 18 && age <= 35) return 12;
  const table: Record<number, number> = { 36: 11, 37: 10, 38: 9, 39: 8, 40: 7, 41: 6, 42: 5, 43: 4, 44: 3, 45: 2, 46: 1 };
  return table[age] ?? 0;
}

function workScore(years: number): number {
  if (years <= 0) return 0;
  if (years === 1) return 9;
  if (years <= 3) return 11;
  if (years <= 5) return 13;
  return 15;
}

export const FSW_CONFIG: CalculatorConfig = {
  slug: "fsw-67",
  title: "Federal Skilled Worker (67 Points)",
  authority: "Government of Canada — IRCC",
  intro:
    "Estimate your score against the Federal Skilled Worker Program's six selection factors. A score of 67 or higher out of 100 may qualify you to enter the Express Entry pool under this program.",
  sourceUrl:
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers/six-selection-factors-federal-skilled-workers.html",
  sourceLabel: "IRCC — Six selection factors (Federal Skilled Worker Program)",
  disclaimer:
    "This tool estimates your Federal Skilled Worker selection-factor score using the official IRCC point tables for language, education, work experience, age, arranged employment, and adaptability. It is for general information only, is not an official assessment, and does not guarantee an Express Entry invitation. Confirm current criteria on IRCC's website and speak with a licensed consultant before applying.",
  groups: [
    {
      title: "Language Skills",
      fields: [
        {
          key: "firstLangClb",
          label: "First Official Language — CLB Level (all 4 abilities)",
          type: "select",
          default: "clb9plus",
          options: [
            { value: "clb9plus", label: "CLB 9 or higher" },
            { value: "clb8", label: "CLB 8" },
            { value: "clb7", label: "CLB 7" },
            { value: "below7", label: "Below CLB 7 (not eligible on language)" },
          ],
        },
        {
          key: "secondLangClb5plus",
          label: "Second Official Language",
          type: "checkbox",
          default: false,
          help: "At least CLB 5 in all four abilities of your second official language.",
        },
      ],
    },
    {
      title: "Education",
      fields: [
        {
          key: "education",
          label: "Highest Level of Education (with ECA, if foreign)",
          type: "select",
          default: "threeYearPlus",
          options: [
            { value: "doctoral", label: "Doctoral (PhD) level" },
            { value: "masters", label: "Master's or eligible professional degree" },
            { value: "twoOrMore", label: "Two or more credentials, one 3+ years" },
            { value: "threeYearPlus", label: "3-year or longer post-secondary credential" },
            { value: "twoYear", label: "2-year post-secondary credential" },
            { value: "oneYear", label: "1-year post-secondary credential" },
            { value: "highSchool", label: "Secondary school (high school) diploma" },
            { value: "lessThanHighSchool", label: "Less than secondary school" },
          ],
        },
      ],
    },
    {
      title: "Work Experience & Age",
      fields: [
        {
          key: "workYears",
          label: "Years of Skilled Work Experience",
          type: "select",
          default: 1,
          options: [
            { value: 0, label: "Less than 1 year" },
            { value: 1, label: "1 year" },
            { value: 2, label: "2–3 years" },
            { value: 4, label: "4–5 years" },
            { value: 6, label: "6 or more years" },
          ],
        },
        { key: "age", label: "Age", type: "number", default: 29, min: 17, max: 99 },
      ],
    },
    {
      title: "Arranged Employment & Adaptability",
      fields: [
        {
          key: "arrangedEmployment",
          label: "I have a valid, full-time job offer (1+ year) from a Canadian employer",
          type: "checkbox",
          default: false,
        },
        {
          key: "spousePastStudy",
          label: "Spouse/partner completed 2+ years of full-time post-secondary study in Canada",
          type: "checkbox",
          default: false,
        },
        {
          key: "pastStudyCanada",
          label: "I completed 2+ years of full-time post-secondary study in Canada",
          type: "checkbox",
          default: false,
        },
        {
          key: "pastWorkCanada",
          label: "I have 1+ year of full-time skilled work experience in Canada",
          type: "checkbox",
          default: false,
        },
        {
          key: "relativeInCanada",
          label: "I (or my accompanying spouse) have a close relative (18+, citizen/PR) in Canada",
          type: "checkbox",
          default: false,
        },
      ],
    },
  ],
  calculate: (input): CalcResult => {
    const firstLang = (CLB_FIRST_LANG_PER_ABILITY[String(input.firstLangClb)] ?? 0) * 4;
    const secondLang = input.secondLangClb5plus ? 4 : 0;
    const languageTotal = Math.min(28, firstLang + secondLang);

    const educationTotal = EDUCATION_POINTS[String(input.education)] ?? 0;
    const workTotal = workScore(Number(input.workYears));
    const ageTotal = ageScore(Number(input.age) || 0);
    const arrangedTotal = input.arrangedEmployment ? 10 : 0;

    let adaptability = 0;
    const adaptItems: { label: string; points: number }[] = [];
    if (input.spousePastStudy) { adaptability += 5; adaptItems.push({ label: "Spouse/partner past study in Canada", points: 5 }); }
    if (input.pastStudyCanada) { adaptability += 5; adaptItems.push({ label: "Your past study in Canada", points: 5 }); }
    if (input.pastWorkCanada) { adaptability += 10; adaptItems.push({ label: "Your past skilled work in Canada", points: 10 }); }
    if (input.arrangedEmployment) { adaptability += 5; adaptItems.push({ label: "Arranged employment", points: 5 }); }
    if (input.relativeInCanada) { adaptability += 5; adaptItems.push({ label: "Relative in Canada", points: 5 }); }
    adaptability = Math.min(10, adaptability);

    const total = languageTotal + educationTotal + workTotal + ageTotal + arrangedTotal + Math.min(10, adaptability);

    return {
      mode: "score",
      total,
      maxPossible: 100,
      passMark: 67,
      verdict: total >= 67 ? "Meets the 67-point pass mark" : "Below the 67-point pass mark",
      verdictPositive: total >= 67,
      sections: [
        { title: "Language Skills", subtotal: languageTotal, items: [{ label: "First + second official language", points: languageTotal }] },
        { title: "Education", subtotal: educationTotal, items: [{ label: "Highest credential", points: educationTotal }] },
        { title: "Work Experience", subtotal: workTotal, items: [{ label: "Years of skilled experience", points: workTotal }] },
        { title: "Age", subtotal: ageTotal, items: [{ label: `Age ${input.age}`, points: ageTotal }] },
        { title: "Arranged Employment", subtotal: arrangedTotal, items: [{ label: "Valid Canadian job offer", points: arrangedTotal }] },
        { title: "Adaptability", subtotal: Math.min(10, adaptability), items: adaptItems.length ? adaptItems : [{ label: "No adaptability factors selected", points: 0 }] },
      ],
    };
  },
};
