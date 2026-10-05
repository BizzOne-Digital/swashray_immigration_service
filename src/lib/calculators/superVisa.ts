/**
 * Super Visa (Parent and Grandparent) — income/eligibility checker.
 * The Super Visa is not a points-based program; eligibility turns on the
 * host's income meeting Statistics Canada's Low Income Cut-Off (LICO) for
 * their family size, plus a few fixed document requirements. Based on:
 *   https://www.canada.ca/.../parent-grandparent-super-visa/forms-documents/host-financial-support.html
 *   https://www.canada.ca/.../temporary-residents/visitors/super-visa.html
 * LICO figures below reflect IRCC's published table (updated July 29, 2025).
 */
import type { CalculatorConfig, CalcResult } from "./types";

const LICO_BASE: Record<number, number> = {
  1: 30526,
  2: 38002,
  3: 46720,
  4: 56724,
  5: 64336,
  6: 72560,
  7: 80784,
};
const LICO_EXTRA_PER_PERSON = 8224;

function licoForSize(size: number): number {
  if (size <= 7) return LICO_BASE[Math.max(1, size)];
  return LICO_BASE[7] + (size - 7) * LICO_EXTRA_PER_PERSON;
}

export const SUPER_VISA_CONFIG: CalculatorConfig = {
  slug: "super-visa",
  title: "Super Visa Eligibility",
  authority: "Government of Canada — IRCC",
  intro:
    "Check whether your household income meets the Low Income Cut-Off (LICO) requirement for sponsoring a parent or grandparent's Super Visa, and confirm the other core eligibility requirements.",
  sourceUrl:
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa/forms-documents/host-financial-support.html",
  sourceLabel: "IRCC — Super Visa host financial support (LICO) requirement",
  disclaimer:
    "This tool checks your income against IRCC's published Low Income Cut-Off (LICO) table and the Super Visa's core requirements (relationship, medical insurance, invitation letter, medical exam). It is for general information only, is not an official admissibility or financial assessment, and LICO figures are updated periodically by Statistics Canada. Confirm current figures on IRCC's website and speak with a licensed consultant before applying.",
  groups: [
    {
      title: "Relationship & Household",
      fields: [
        {
          key: "relationship",
          label: "Relationship to the Applicant",
          type: "select",
          default: "parent",
          options: [
            { value: "parent", label: "Parent" },
            { value: "grandparent", label: "Grandparent" },
            { value: "other", label: "Other relationship (not eligible for Super Visa)" },
          ],
        },
        {
          key: "familySize",
          label: "Total Family Size (including yourself, dependents, and the visiting parent/grandparent)",
          type: "number",
          default: 3,
          min: 1,
          max: 15,
        },
        { key: "annualIncome", label: "Your Total Household Income (last tax year, CAD $)", type: "number", default: 55000, min: 0, max: 2000000 },
      ],
    },
    {
      title: "Other Requirements",
      fields: [
        {
          key: "hasInvitationLetter",
          label: "I will provide a signed letter of invitation with a promise of financial support",
          type: "checkbox",
          default: true,
        },
        {
          key: "hasInsurance",
          label: "The applicant has (or will buy) Canadian medical insurance of at least $100,000, valid 1+ year",
          type: "checkbox",
          default: true,
        },
        {
          key: "willingMedicalExam",
          label: "The applicant is willing to complete an immigration medical exam",
          type: "checkbox",
          default: true,
        },
      ],
    },
  ],
  calculate: (input): CalcResult => {
    const familySize = Math.max(1, Number(input.familySize) || 1);
    const income = Number(input.annualIncome) || 0;
    const requiredIncome = licoForSize(familySize);
    const incomeMet = income >= requiredIncome;
    const relationshipOk = input.relationship === "parent" || input.relationship === "grandparent";

    const checks = [
      { label: "Eligible relationship (parent or grandparent)", points: relationshipOk ? 1 : 0 },
      { label: `Household income meets LICO ($${requiredIncome.toLocaleString()} for family of ${familySize})`, points: incomeMet ? 1 : 0 },
      { label: "Letter of invitation with financial support", points: input.hasInvitationLetter ? 1 : 0 },
      { label: "Qualifying medical insurance ($100,000+, 1+ year)", points: input.hasInsurance ? 1 : 0 },
      { label: "Willing to complete immigration medical exam", points: input.willingMedicalExam ? 1 : 0 },
    ];
    const allMet = checks.every((c) => c.points === 1);

    const notes: string[] = [];
    if (!incomeMet) {
      notes.push(
        `Your income is $${(requiredIncome - income).toLocaleString()} below the LICO threshold for a family of ${familySize}. You may still qualify by combining 75% of your own income with the applicant's income — speak with a consultant about this option.`
      );
    }
    if (!relationshipOk) {
      notes.push("The Super Visa is only available to parents and grandparents of Canadian citizens, permanent residents, or persons registered under the Indian Act.");
    }

    return {
      mode: "eligibility",
      verdict: allMet ? "Appears to meet the core Super Visa requirements" : "Does not yet meet all core requirements",
      verdictPositive: allMet,
      sections: [{ title: "Eligibility Checklist", subtotal: checks.filter((c) => c.points).length, items: checks }],
      notes,
    };
  },
};
