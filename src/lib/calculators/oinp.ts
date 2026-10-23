/**
 * Ontario Immigrant Nominee Program (OINP) — Ontario Workforce Priority
 * stream Expression of Interest points, rendered by <OinpCalculator /> at
 * /calculators/oinp.
 *
 * Every factor and point value below is Ontario's published scoring grid:
 * https://www.ontario.ca/page/ontario-workforce-priority-stream
 * (published July 20, 2026; checked against the October 20, 2026 update,
 * which added the $80k-or-more earnings band). Job offer applicants can
 * score up to 132 points. Self-employed physicians have no hourly wage
 * factor, so their maximum is 117.
 *
 * TEER and broad occupational category both come from the applicant's
 * NOC 2021 code — ./nocOccupations.ts holds the searchable list.
 */

export const OINP_SOURCE_URL = "https://www.ontario.ca/page/ontario-workforce-priority-stream";
export const OINP_GRID_PUBLISHED = "July 20, 2026";
export const OINP_GRID_UPDATED = "October 20, 2026";

export type OinpPathway = "skilled" | "essential" | "physician";

export interface OinpOption {
  label: string;
  points: number;
}

export const OINP_PATHWAYS: { value: OinpPathway; label: string; hint: string }[] = [
  { value: "skilled", label: "Ontario job offer, skilled occupation", hint: "NOC TEER 0 to 3" },
  { value: "essential", label: "Ontario job offer, essential occupation", hint: "NOC TEER 4 or 5" },
  {
    value: "physician",
    label: "Self-employed physician in Ontario",
    hint: "Medical practice experience replaces the hourly wage factor",
  },
];

/** NOC TEER category — the second digit of the code. */
export const TEER_POINTS: Record<string, number> = { "0": 9, "1": 9, "2": 6, "3": 6, "4": 0, "5": 0 };

/** NOC broad occupational category — the first digit of the code. */
export const CATEGORY_POINTS: Record<string, number> = {
  "0": 4,
  "1": 4,
  "2": 6,
  "3": 10,
  "4": 4,
  "5": 2,
  "6": 2,
  "7": 8,
  "8": 4,
  "9": 4,
};

export const CATEGORY_NAMES: Record<string, string> = {
  "0": "Legislative and senior management",
  "1": "Business, finance and administration",
  "2": "Natural and applied sciences",
  "3": "Health",
  "4": "Education, law and social, community and government services",
  "5": "Art, culture, recreation and sport",
  "6": "Sales and service",
  "7": "Trades, transport and equipment operators",
  "8": "Natural resources, agriculture and related production",
  "9": "Manufacturing and utilities",
};

/** Manual TEER choices for an occupation the search can't find; each value is the group's first TEER digit. */
export const TEER_GROUPS: { value: string; label: string }[] = [
  { value: "0", label: "TEER 0 or 1 — management, or usually a university degree" },
  { value: "2", label: "TEER 2 or 3 — college, apprenticeship or supervisory" },
  { value: "4", label: "TEER 4 or 5 — high school or short-term training" },
];

export function teerGroup(teer: string) {
  const digit = Number(teer);
  return digit <= 1 ? "0" : digit <= 3 ? "2" : "4";
}

/** Physician NOC codes (31100, 31101, 31102) are all TEER 1 in the health category; Ontario prepopulates both. */
export const PHYSICIAN_NOC = { teer: "1", category: "3" } as const;

/** Work location: Ontario scores the census division of the job offer's work location (or the physician's OHIP practice address). */
export const OINP_REGIONS: { label: string; points: number; divisions: string[] }[] = [
  {
    label: "Northern Ontario",
    points: 15,
    divisions: [
      "Algoma — Sault Ste. Marie",
      "Cochrane — Timmins",
      "Greater Sudbury",
      "Haliburton",
      "Kenora",
      "Manitoulin",
      "Muskoka — Huntsville, Bracebridge",
      "Nipissing — North Bay",
      "Parry Sound",
      "Rainy River",
      "Sudbury District",
      "Thunder Bay",
      "Timiskaming",
    ],
  },
  {
    label: "Eastern Ontario",
    points: 10,
    divisions: [
      "Frontenac — Kingston",
      "Hastings — Belleville",
      "Kawartha Lakes",
      "Lanark",
      "Leeds and Grenville — Brockville",
      "Lennox and Addington",
      "Northumberland — Cobourg",
      "Ottawa",
      "Peterborough",
      "Prescott and Russell",
      "Prince Edward",
      "Renfrew — Pembroke",
      "Stormont, Dundas and Glengarry — Cornwall",
    ],
  },
  {
    label: "Central Ontario, outside the GTA",
    points: 10,
    divisions: [
      "Dufferin — Orangeville",
      "Grey — Owen Sound",
      "Simcoe — Barrie, Orillia",
      "Waterloo — Kitchener, Waterloo, Cambridge",
      "Wellington — Guelph",
    ],
  },
  {
    label: "Southwestern Ontario",
    points: 10,
    divisions: [
      "Brant — Brantford",
      "Bruce",
      "Chatham-Kent",
      "Elgin — St. Thomas",
      "Essex — Windsor",
      "Haldimand-Norfolk",
      "Hamilton",
      "Huron",
      "Lambton — Sarnia",
      "Middlesex — London",
      "Niagara — St. Catharines, Niagara Falls",
      "Oxford — Woodstock",
      "Perth — Stratford",
    ],
  },
  {
    label: "Inside the GTA, except Toronto",
    points: 5,
    divisions: [
      "Durham — Oshawa, Whitby, Ajax, Pickering",
      "Halton — Oakville, Burlington, Milton",
      "Peel — Mississauga, Brampton",
      "York — Markham, Vaughan, Richmond Hill",
    ],
  },
  { label: "Toronto", points: 0, divisions: ["City of Toronto"] },
];

/** Each answer below is stored as the index of the chosen option. */
export const OINP_CHOICES = {
  wage: [
    { label: "$40.00 an hour or more", points: 15 },
    { label: "$35.00 to $39.99 an hour", points: 12 },
    { label: "$30.00 to $34.99 an hour", points: 10 },
    { label: "$25.00 to $29.99 an hour", points: 8 },
    { label: "$20.00 to $24.99 an hour", points: 5 },
    { label: "Less than $20.00 an hour", points: 0 },
  ],
  offerExperience: [
    { label: "More than 24 months", points: 18 },
    { label: "13 to 24 months", points: 15 },
    { label: "6 to 12 months", points: 12 },
    { label: "Less than 6 months, or not currently in the position", points: 0 },
  ],
  ontarioExperience: [
    { label: "More than 24 months", points: 12 },
    { label: "13 to 24 months", points: 9 },
    { label: "6 to 12 months", points: 6 },
    { label: "Less than 6 months, or not currently working in Ontario", points: 0 },
  ],
  physicianPractice: [
    { label: "More than 24 months (2 years or more)", points: 18 },
    { label: "13 to 24 months", points: 15 },
    { label: "6 to 12 months", points: 12 },
    { label: "Less than 6 months", points: 0 },
  ],
  earnings: [
    { label: "$80,000 or more in a year", points: 10 },
    { label: "$70,000 to $79,999", points: 8 },
    { label: "$50,000 to $69,999", points: 6 },
    { label: "$30,000 to $49,999", points: 4 },
    { label: "Under $30,000, or no Canadian tax history", points: 0 },
  ],
  status: [
    { label: "Valid Canadian work permit", points: 10 },
    { label: "Valid Canadian study permit", points: 5 },
    { label: "No valid work or study permit", points: 0 },
  ],
  education: [
    { label: "Doctorate, or a degree in medicine, dentistry, veterinary medicine or optometry", points: 10 },
    { label: "Master's degree", points: 8 },
    { label: "University certificate or diploma above a bachelor's degree", points: 6 },
    { label: "Bachelor's degree or equivalent", points: 6 },
    { label: "Ontario College Graduate Certificate", points: 5 },
    { label: "University certificate or diploma below a bachelor's degree", points: 5 },
    { label: "College, CEGEP or other non-university certificate or diploma", points: 5 },
    { label: "Apprenticeship or trades certificate or diploma", points: 5 },
    { label: "Less than a college or trade certificate", points: 0 },
  ],
  canadianCredentials: [
    { label: "More than one Canadian post-secondary credential", points: 10 },
    { label: "One Canadian post-secondary credential", points: 5 },
    { label: "None", points: 0 },
  ],
  clb: [
    { label: "CLB 9 or higher", points: 15 },
    { label: "CLB 8", points: 12 },
    { label: "CLB 7", points: 8 },
    { label: "CLB 6", points: 4 },
    { label: "CLB 5 or lower", points: 0 },
  ],
  officialLanguages: [
    { label: "English and French, CLB 6 or higher in all four abilities on both tests", points: 10 },
    { label: "One official language", points: 5 },
    { label: "No approved language test result yet", points: 0 },
  ],
  region: OINP_REGIONS.flatMap((region) =>
    region.divisions.map((division) => ({ label: division, points: region.points }))
  ),
} satisfies Record<string, OinpOption[]>;

export type OinpChoiceKey = keyof typeof OINP_CHOICES;

/** The regions with each census division's index into OINP_CHOICES.region, for a grouped select. */
export const OINP_REGION_GROUPS = OINP_REGIONS.map((region, r) => {
  const offset = OINP_REGIONS.slice(0, r).reduce((sum, previous) => sum + previous.divisions.length, 0);
  return {
    label: region.label,
    points: region.points,
    options: region.divisions.map((label, i) => ({ label, index: offset + i })),
  };
});

export type OinpFactorKey =
  | "teer"
  | "category"
  | "wage"
  | "experience"
  | "earnings"
  | "status"
  | "education"
  | "canadianCredentials"
  | "clb"
  | "officialLanguages"
  | "region";

export const OINP_FACTORS: Record<OinpFactorKey, { label: string; max: number }> = {
  teer: { label: "TEER category", max: 9 },
  category: { label: "Occupational category", max: 10 },
  wage: { label: "Hourly wage", max: 15 },
  experience: { label: "Ontario work experience", max: 18 },
  earnings: { label: "Canadian earnings", max: 10 },
  status: { label: "Status in Canada", max: 10 },
  education: { label: "Highest education", max: 10 },
  canadianCredentials: { label: "Canadian credentials", max: 10 },
  clb: { label: "Language level", max: 15 },
  officialLanguages: { label: "Official languages", max: 10 },
  region: { label: "Work location", max: 15 },
};

export function oinpMaxScore(pathway: OinpPathway) {
  const all = Object.values(OINP_FACTORS).reduce((sum, factor) => sum + factor.max, 0);
  return pathway === "physician" ? all - OINP_FACTORS.wage.max : all;
}

export interface OinpAnswers {
  pathway: OinpPathway | null;
  /** NOC TEER digit ("0"–"5"), from the occupation search or the manual picker. */
  teer: string | null;
  /** NOC broad occupational category digit ("0"–"9"). */
  category: string | null;
  choices: Partial<Record<OinpChoiceKey, number>>;
}

export const EMPTY_OINP_ANSWERS: OinpAnswers = { pathway: null, teer: null, category: null, choices: {} };

export interface OinpBreakdownRow {
  key: OinpFactorKey;
  label: string;
  points: number;
  max: number;
  answered: boolean;
}

export interface OinpResult {
  total: number;
  maxPossible: number;
  rows: OinpBreakdownRow[];
  answeredCount: number;
}

export function calculateOinp(answers: OinpAnswers): OinpResult | null {
  const { pathway, choices } = answers;
  if (!pathway) return null;
  const physician = pathway === "physician";

  const points = (key: OinpChoiceKey) => {
    const index = choices[key];
    return index === undefined ? null : (OINP_CHOICES[key][index]?.points ?? null);
  };
  const teer = physician ? PHYSICIAN_NOC.teer : answers.teer;
  const category = physician ? PHYSICIAN_NOC.category : answers.category;

  // Job offer applicants are scored on months in the offer position; only
  // those with less than 6 months there are scored on Ontario-wide
  // experience instead. The two are never added together.
  const offer = points("offerExperience");
  const experience = physician
    ? points("physicianPractice")
    : offer !== null && offer > 0
      ? offer
      : points("ontarioExperience");

  const values: [OinpFactorKey, number | null][] = [
    ["teer", teer === null ? null : TEER_POINTS[teer]],
    ["category", category === null ? null : CATEGORY_POINTS[category]],
    ["wage", points("wage")],
    ["experience", experience],
    ["earnings", points("earnings")],
    ["status", points("status")],
    ["education", points("education")],
    ["canadianCredentials", points("canadianCredentials")],
    ["clb", points("clb")],
    ["officialLanguages", points("officialLanguages")],
    ["region", points("region")],
  ];

  const rows = values
    .filter(([key]) => !(physician && key === "wage"))
    .map(([key, value]) => ({ key, ...OINP_FACTORS[key], points: value ?? 0, answered: value !== null }));

  return {
    total: rows.reduce((sum, row) => sum + row.points, 0),
    maxPossible: rows.reduce((sum, row) => sum + row.max, 0),
    rows,
    answeredCount: rows.filter((row) => row.answered).length,
  };
}
