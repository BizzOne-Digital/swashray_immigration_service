/**
 * Shared types for the interactive point-calculators under /calculators/[slug].
 * Each program (FSW, SINP, Alberta AAIP, etc.) is defined as a declarative
 * CalculatorConfig in its own file under src/lib/calculators/, and rendered
 * by the single <GenericCalculator /> component — see that file for the UI.
 *
 * Two result "modes" are supported because not every program actually scores
 * applicants numerically:
 *  - "score": a numeric points total against a maximum (and optionally a
 *    pass mark) — e.g. FSW's 67-point threshold.
 *  - "eligibility": a pass/fail determination against fixed criteria, used
 *    for programs that don't publish a points grid at all (e.g. Nova
 *    Scotia's Skilled Worker stream, or the Super Visa's income test).
 */

export type FieldType = "select" | "number" | "checkbox";

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  default: string | number | boolean;
  min?: number;
  max?: number;
  help?: string;
  /** Show this field only when the predicate over the current input returns true. */
  showIf?: (input: Record<string, unknown>) => boolean;
}

export interface FieldGroup {
  title: string;
  fields: FieldDef[];
  showIf?: (input: Record<string, unknown>) => boolean;
}

export interface CalcBreakdownItem {
  label: string;
  points: number;
}

export interface CalcSection {
  title: string;
  items: CalcBreakdownItem[];
  subtotal: number;
}

export interface CalcResult {
  mode: "score" | "eligibility";
  total?: number;
  maxPossible?: number;
  passMark?: number;
  verdict?: string;
  verdictPositive?: boolean;
  sections: CalcSection[];
  notes?: string[];
}

export interface CalculatorConfig {
  slug: string;
  title: string;
  authority: string;
  intro: string;
  groups: FieldGroup[];
  calculate: (input: Record<string, unknown>) => CalcResult;
  disclaimer: string;
  sourceUrl: string;
  sourceLabel: string;
}

export function defaultsFromConfig(config: CalculatorConfig): Record<string, unknown> {
  const input: Record<string, unknown> = {};
  for (const group of config.groups) {
    for (const field of group.fields) {
      input[field.key] = field.default;
    }
  }
  return input;
}
