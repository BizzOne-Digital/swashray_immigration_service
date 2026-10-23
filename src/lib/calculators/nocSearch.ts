/**
 * Job-title search over the NOC 2021 unit groups for the OINP calculator's
 * occupation picker. A query matches a group's class title, its official
 * illustrative job titles, a common abbreviation, or the start of its
 * 5-digit code.
 */
import { NOC_UNIT_GROUPS } from "./nocOccupations";

export interface NocMatch {
  code: string;
  title: string;
  /** The job title that matched, when the class title itself didn't. */
  example?: string;
}

/**
 * Abbreviations people search by that the illustrative titles don't spell
 * out, mapped to the unit groups NOC 2021's full job-title index lists them
 * under (e.g. "personal support worker" appears under both 33102 and 44101).
 */
const ABBREVIATIONS: Record<string, { label: string; codes: string[] }> = {
  psw: { label: "personal support worker", codes: ["33102", "44101"] },
  "personal support worker": { label: "personal support worker", codes: ["33102", "44101"] },
  rn: { label: "registered nurse", codes: ["31301"] },
  rpn: { label: "registered practical nurse", codes: ["32101"] },
  lpn: { label: "licensed practical nurse", codes: ["32101"] },
  ece: { label: "early childhood educator", codes: ["42202"] },
  childcare: { label: "child care worker", codes: ["42202", "44100"] },
  hvac: { label: "HVAC mechanic", codes: ["72402"] },
  cpa: { label: "chartered professional accountant", codes: ["11100"] },
  "az driver": { label: "tractor-trailer (AZ) driver", codes: ["73300"] },
  "dz driver": { label: "straight truck (DZ) driver", codes: ["73300"] },
};

export function normalizeSearchText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const NOC_INDEX = NOC_UNIT_GROUPS.map(([code, title, examples]) => {
  const exampleList = examples ? examples.split("|") : [];
  return {
    code,
    title,
    examples: exampleList,
    normalizedTitle: normalizeSearchText(title),
    normalizedExamples: exampleList.map(normalizeSearchText),
  };
});

/**
 * Scores how `text` matches `query` (both normalized): 6 = the whole text,
 * 5 = whole word(s) at the start, 4 = whole word(s) later on, 3 = the start
 * of the text, 2 = the start of a later word, 1 = inside a word (queries of
 * 4+ characters only), 0 = no match. A plural ending still counts as a whole
 * word, so "nurse" fully matches "nurses" but only partly matches "nursery".
 */
function strengthFor(query: string) {
  // Normalized text is only [a-z0-9 ], so the query is safe inside a pattern.
  const wholeWord = new RegExp(`(^| )${query}(s|es)?( |$)`);
  return (text: string) => {
    if (text === query) return 6;
    const whole = wholeWord.exec(text);
    if (whole) return whole.index === 0 ? 5 : 4;
    if (text.startsWith(query)) return 3;
    if (text.includes(` ${query}`)) return 2;
    // Short queries like "rn" would otherwise hit the middle of unrelated words ("journalist").
    return query.length >= 4 && text.includes(query) ? 1 : 0;
  };
}

export function searchOccupations(raw: string, limit = 8): NocMatch[] {
  const query = normalizeSearchText(raw);
  if (query.length < 2) return [];
  const strength = strengthFor(query);
  const abbreviation = ABBREVIATIONS[query];
  const ranked: { match: NocMatch; score: number }[] = [];

  for (const entry of NOC_INDEX) {
    if (abbreviation?.codes.includes(entry.code)) {
      ranked.push({ match: { code: entry.code, title: entry.title, example: abbreviation.label }, score: 200 });
      continue;
    }
    let score = /^\d+$/.test(query) && entry.code.startsWith(query) ? 150 : strength(entry.normalizedTitle) * 20;
    let example: string | undefined;
    entry.normalizedExamples.forEach((text, i) => {
      const exampleScore = strength(text) * 18;
      if (exampleScore > score) {
        score = exampleScore;
        example = entry.examples[i];
      }
    });
    if (score > 0) ranked.push({ match: { code: entry.code, title: entry.title, example }, score });
  }

  // Nothing matched the phrase as typed: fall back to occupations that contain every word.
  if (ranked.length === 0 && query.includes(" ")) {
    const words = query.split(" ");
    for (const entry of NOC_INDEX) {
      const haystack = `${entry.normalizedTitle} ${entry.normalizedExamples.join(" ")}`;
      if (words.every((word) => haystack.includes(word))) {
        ranked.push({ match: { code: entry.code, title: entry.title }, score: 1 });
      }
    }
  }

  return ranked
    .sort((a, b) => b.score - a.score || a.match.title.length - b.match.title.length)
    .slice(0, limit)
    .map((r) => r.match);
}
