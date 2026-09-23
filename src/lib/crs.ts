/**
 * Comprehensive Ranking System (CRS) — Express Entry points calculation.
 *
 * This mirrors the OFFICIAL point tables published by Immigration, Refugees
 * and Citizenship Canada (IRCC) at:
 *   https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
 *
 * It is kept in one file, as plain data + pure functions, specifically so it
 * can be updated later without touching any UI code if/when IRCC revises the
 * point tables (this happens occasionally — e.g. job-offer points were
 * removed as of March 25, 2025, which is why there is no job-offer factor
 * below).
 *
 * This is NOT an official government tool and does not replace an official
 * eligibility assessment — see the disclaimer shown alongside the calculator
 * UI (components/site/CrsCalculator.tsx).
 */

export type MaritalStatus = "single" | "withSpouse";
export type EducationLevel =
  | "lessThanSecondary"
  | "secondary"
  | "oneYear"
  | "twoYear"
  | "bachelors"
  | "twoOrMoreCredentials"
  | "masters"
  | "doctoral";
export type ClbLevel = "none" | "clb4" | "clb5" | "clb6" | "clb7" | "clb8" | "clb9" | "clb10plus";
export type WorkYears = 0 | 1 | 2 | 3 | 4 | 5;
export type ForeignWorkYears = "none" | "oneToTwo" | "threePlus";
export type CanadianEducation = "none" | "oneOrTwoYear" | "threePlusYear";

export interface CrsInput {
  maritalStatus: MaritalStatus;
  age: number;
  education: EducationLevel;
  firstLanguageClb: ClbLevel;
  secondLanguageClb: ClbLevel;
  canadianWorkYears: WorkYears;
  foreignWorkYears: ForeignWorkYears;
  hasCertificateOfQualification: boolean;
  provincialNomination: boolean;
  canadianEducation: CanadianEducation;
  siblingInCanada: boolean;
  frenchNclc7Plus: boolean;
  // Spouse factors — only used when maritalStatus === "withSpouse"
  spouseEducation?: EducationLevel;
  spouseFirstLanguageClb?: ClbLevel;
  spouseCanadianWorkYears?: WorkYears;
}

export interface CrsBreakdownItem {
  label: string;
  points: number;
}

export interface CrsResult {
  total: number;
  maxPossible: number;
  sections: { title: string; items: CrsBreakdownItem[]; subtotal: number }[];
}

const clbRank: Record<ClbLevel, number> = {
  none: 0,
  clb4: 4,
  clb5: 5,
  clb6: 6,
  clb7: 7,
  clb8: 8,
  clb9: 9,
  clb10plus: 10,
};

// --- Age (per year, official table) ---
const AGE_POINTS_SINGLE: Record<number, number> = {
  17: 0, 18: 99, 19: 105, 20: 110, 21: 110, 22: 110, 23: 110, 24: 110, 25: 110, 26: 110, 27: 110, 28: 110, 29: 110,
  30: 105, 31: 99, 32: 94, 33: 88, 34: 83, 35: 77, 36: 72, 37: 66, 38: 61, 39: 55, 40: 50, 41: 39, 42: 28, 43: 17, 44: 6,
};
const AGE_POINTS_SPOUSE: Record<number, number> = {
  17: 0, 18: 90, 19: 95, 20: 100, 21: 100, 22: 100, 23: 100, 24: 100, 25: 100, 26: 100, 27: 100, 28: 100, 29: 100,
  30: 95, 31: 90, 32: 85, 33: 80, 34: 75, 35: 70, 36: 65, 37: 60, 38: 55, 39: 50, 40: 45, 41: 35, 42: 25, 43: 15, 44: 5,
};
function agePoints(age: number, withSpouse: boolean): number {
  const table = withSpouse ? AGE_POINTS_SPOUSE : AGE_POINTS_SINGLE;
  if (age <= 17) return 0;
  if (age >= 45) return 0;
  return table[Math.floor(age)] ?? 0;
}

// --- Education (principal applicant) ---
const EDUCATION_POINTS_SINGLE: Record<EducationLevel, number> = {
  lessThanSecondary: 0,
  secondary: 30,
  oneYear: 90,
  twoYear: 98,
  bachelors: 120,
  twoOrMoreCredentials: 128,
  masters: 135,
  doctoral: 150,
};
const EDUCATION_POINTS_SPOUSE: Record<EducationLevel, number> = {
  lessThanSecondary: 0,
  secondary: 28,
  oneYear: 84,
  twoYear: 91,
  bachelors: 112,
  twoOrMoreCredentials: 119,
  masters: 126,
  doctoral: 140,
};
export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  lessThanSecondary: "Less than secondary (high school)",
  secondary: "Secondary diploma (high school)",
  oneYear: "One-year post-secondary program/certificate",
  twoYear: "Two-year post-secondary program",
  bachelors: "Bachelor's degree (3+ year program)",
  twoOrMoreCredentials: "Two or more credentials, one 3+ years",
  masters: "Master's degree or professional degree",
  doctoral: "Doctoral (PhD) degree",
};

// --- Spouse-only supplementary factors ---
const SPOUSE_EDUCATION_POINTS: Record<EducationLevel, number> = {
  lessThanSecondary: 0,
  secondary: 2,
  oneYear: 6,
  twoYear: 7,
  bachelors: 8,
  twoOrMoreCredentials: 9,
  masters: 10,
  doctoral: 10,
};
const SPOUSE_LANGUAGE_POINTS_PER_ABILITY: Record<ClbLevel, number> = {
  none: 0, clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 5, clb10plus: 5,
};
const SPOUSE_WORK_POINTS: Record<WorkYears, number> = { 0: 0, 1: 5, 2: 7, 3: 8, 4: 9, 5: 10 };

// --- Official first / second language points (per ability; 4 abilities) ---
const FIRST_LANG_PER_ABILITY_SINGLE: Record<ClbLevel, number> = {
  none: 0, clb4: 6, clb5: 6, clb6: 9, clb7: 17, clb8: 23, clb9: 31, clb10plus: 34,
};
const FIRST_LANG_PER_ABILITY_SPOUSE: Record<ClbLevel, number> = {
  none: 0, clb4: 6, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 29, clb10plus: 32,
};
const SECOND_LANG_PER_ABILITY: Record<ClbLevel, number> = {
  none: 0, clb4: 1, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 6, clb10plus: 6,
};

export const CLB_LABELS: Record<ClbLevel, string> = {
  none: "Below CLB 4 / not tested",
  clb4: "CLB 4",
  clb5: "CLB 5",
  clb6: "CLB 6",
  clb7: "CLB 7",
  clb8: "CLB 8",
  clb9: "CLB 9",
  clb10plus: "CLB 10 or higher",
};

// --- Canadian work experience ---
const CANADIAN_WORK_SINGLE: Record<WorkYears, number> = { 0: 0, 1: 40, 2: 53, 3: 64, 4: 72, 5: 80 };
const CANADIAN_WORK_SPOUSE: Record<WorkYears, number> = { 0: 0, 1: 35, 2: 46, 3: 56, 4: 63, 5: 70 };

function skillTransferPoints(input: CrsInput): CrsBreakdownItem[] {
  const items: CrsBreakdownItem[] = [];
  const clbRankVal = clbRank[input.firstLanguageClb];
  const strongLang = clbRankVal >= 9; // CLB 9+
  const goodLang = clbRankVal >= 7; // CLB 7-8 (or higher)
  const hasPostSecondary = input.education !== "lessThanSecondary" && input.education !== "secondary";

  // Education + language (max 50)
  let eduLangPoints = 0;
  if (hasPostSecondary) {
    if (strongLang) eduLangPoints = 50;
    else if (goodLang) eduLangPoints = 25;
  }
  // Education + Canadian work experience (max 50, combined cap with above at 50 per official grid section)
  let eduWorkPoints = 0;
  if (hasPostSecondary) {
    if (input.canadianWorkYears >= 2) eduWorkPoints = 50;
    else if (input.canadianWorkYears >= 1) eduWorkPoints = 25;
  }
  const educationCombined = Math.min(50, Math.max(eduLangPoints, eduWorkPoints));
  items.push({ label: "Education + language ability / Canadian work experience", points: educationCombined });

  // Foreign work experience + language, and + Canadian experience (max 50 combined)
  const foreignYears = input.foreignWorkYears;
  let foreignLangPoints = 0;
  if (foreignYears === "threePlus") {
    if (strongLang) foreignLangPoints = 50;
    else if (goodLang) foreignLangPoints = 25;
  } else if (foreignYears === "oneToTwo") {
    if (strongLang) foreignLangPoints = 25;
    else if (goodLang) foreignLangPoints = 13;
  }
  let foreignCanadianPoints = 0;
  if (foreignYears === "threePlus" && input.canadianWorkYears >= 2) foreignCanadianPoints = 50;
  else if (foreignYears === "threePlus" && input.canadianWorkYears >= 1) foreignCanadianPoints = 25;
  else if (foreignYears === "oneToTwo" && input.canadianWorkYears >= 2) foreignCanadianPoints = 25;
  else if (foreignYears === "oneToTwo" && input.canadianWorkYears >= 1) foreignCanadianPoints = 13;
  const foreignCombined = Math.min(50, Math.max(foreignLangPoints, foreignCanadianPoints));
  items.push({ label: "Foreign work experience + language / Canadian work experience", points: foreignCombined });

  // Certificate of qualification (trade) + language (max 50, but total transferability capped at 100 overall)
  let certPoints = 0;
  if (input.hasCertificateOfQualification) {
    if (clbRankVal >= 7) certPoints = 50;
    else if (clbRankVal >= 5) certPoints = 25;
  }
  items.push({ label: "Certificate of qualification + language", points: certPoints });

  return items;
}

export function calculateCrs(input: CrsInput): CrsResult {
  const withSpouse = input.maritalStatus === "withSpouse";

  // Core / human capital factors
  const coreItems: CrsBreakdownItem[] = [
    { label: "Age", points: agePoints(input.age, withSpouse) },
    {
      label: `Education — ${EDUCATION_LABELS[input.education]}`,
      points: withSpouse ? EDUCATION_POINTS_SPOUSE[input.education] : EDUCATION_POINTS_SINGLE[input.education],
    },
    {
      label: "First official language (4 abilities)",
      points:
        (withSpouse ? FIRST_LANG_PER_ABILITY_SPOUSE[input.firstLanguageClb] : FIRST_LANG_PER_ABILITY_SINGLE[input.firstLanguageClb]) * 4,
    },
    { label: "Second official language (4 abilities)", points: SECOND_LANG_PER_ABILITY[input.secondLanguageClb] * 4 },
    {
      label: "Canadian work experience",
      points: withSpouse ? CANADIAN_WORK_SPOUSE[input.canadianWorkYears] : CANADIAN_WORK_SINGLE[input.canadianWorkYears],
    },
  ];
  const coreMax = withSpouse ? 460 : 500;
  const coreSubtotal = Math.min(coreMax, coreItems.reduce((s, i) => s + i.points, 0));

  const sections: CrsResult["sections"] = [
    { title: "Core / Human Capital Factors", items: coreItems, subtotal: coreSubtotal },
  ];

  // Spouse factors
  if (withSpouse) {
    const spouseItems: CrsBreakdownItem[] = [
      {
        label: `Spouse education — ${input.spouseEducation ? EDUCATION_LABELS[input.spouseEducation] : "Not provided"}`,
        points: input.spouseEducation ? SPOUSE_EDUCATION_POINTS[input.spouseEducation] : 0,
      },
      {
        label: "Spouse first official language (4 abilities)",
        points: (input.spouseFirstLanguageClb ? SPOUSE_LANGUAGE_POINTS_PER_ABILITY[input.spouseFirstLanguageClb] : 0) * 4,
      },
      {
        label: "Spouse Canadian work experience",
        points: input.spouseCanadianWorkYears !== undefined ? SPOUSE_WORK_POINTS[input.spouseCanadianWorkYears] : 0,
      },
    ];
    const spouseSubtotal = Math.min(40, spouseItems.reduce((s, i) => s + i.points, 0));
    sections.push({ title: "Spouse / Common-Law Partner Factors", items: spouseItems, subtotal: spouseSubtotal });
  }

  // Skill transferability (capped at 100)
  const transferItems = skillTransferPoints(input);
  const transferSubtotal = Math.min(100, transferItems.reduce((s, i) => s + i.points, 0));
  sections.push({ title: "Skill Transferability Factors", items: transferItems, subtotal: transferSubtotal });

  // Additional points
  const additionalItems: CrsBreakdownItem[] = [
    { label: "Provincial or territorial nomination", points: input.provincialNomination ? 600 : 0 },
    {
      label: "Canadian post-secondary education/credential",
      points: input.canadianEducation === "threePlusYear" ? 30 : input.canadianEducation === "oneOrTwoYear" ? 15 : 0,
    },
    { label: "Sibling living in Canada (citizen/PR)", points: input.siblingInCanada ? 15 : 0 },
    {
      label: "French language proficiency bonus",
      points: input.frenchNclc7Plus ? (clbRank[input.firstLanguageClb] >= 5 ? 50 : 25) : 0,
    },
  ];
  const additionalSubtotal = additionalItems.reduce((s, i) => s + i.points, 0);
  sections.push({ title: "Additional Points", items: additionalItems, subtotal: additionalSubtotal });

  const total = sections.reduce((s, sec) => s + sec.subtotal, 0);

  return { total: Math.min(1200, total), maxPossible: 1200, sections };
}

export const CRS_DISCLAIMER =
  "This calculator estimates a Comprehensive Ranking System (CRS) score using the point tables published by Immigration, Refugees and Citizenship Canada (IRCC) for the Express Entry system. Results are estimates for informational purposes only and do not constitute legal or immigration advice, nor an official determination of eligibility. Your actual score can only be confirmed by IRCC once you submit a complete Express Entry profile. For guidance specific to your situation, book a consultation with our RCIC-IRB licensed consultant.";
