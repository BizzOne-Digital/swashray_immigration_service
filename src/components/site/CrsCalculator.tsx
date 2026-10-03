"use client";

import { useState } from "react";
import {
  calculateCrs,
  CRS_DISCLAIMER,
  EDUCATION_LABELS,
  CLB_LABELS,
  type CrsInput,
  type CrsResult,
  type MaritalStatus,
  type EducationLevel,
  type ClbLevel,
  type WorkYears,
  type ForeignWorkYears,
  type CanadianEducation,
} from "@/lib/crs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Info, RotateCcw } from "lucide-react";

const selectClass =
  "w-full rounded-[var(--radius-btn)] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all";
const labelClass = "block text-sm font-medium text-[var(--color-ink)] mb-1.5";
const fieldsetClass = "space-y-4";

const EDUCATION_OPTIONS = Object.keys(EDUCATION_LABELS) as EducationLevel[];
const CLB_OPTIONS = Object.keys(CLB_LABELS) as ClbLevel[];

const DEFAULT_INPUT: CrsInput = {
  maritalStatus: "single",
  age: 29,
  education: "bachelors",
  firstLanguageClb: "clb9",
  secondLanguageClb: "none",
  canadianWorkYears: 0,
  foreignWorkYears: "none",
  hasCertificateOfQualification: false,
  provincialNomination: false,
  canadianEducation: "none",
  siblingInCanada: false,
  frenchNclc7Plus: false,
};

export function CrsCalculator() {
  const [input, setInput] = useState<CrsInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<CrsResult | null>(null);
  const [ageError, setAgeError] = useState("");

  function set<K extends keyof CrsInput>(key: K, value: CrsInput[K]) {
    setInput((v) => ({ ...v, [key]: value }));
  }

  function onCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!input.age || input.age < 17 || input.age > 99) {
      setAgeError("Please enter a valid age between 17 and 99.");
      setResult(null);
      return;
    }
    setAgeError("");
    setResult(calculateCrs(input));
  }

  function onReset() {
    setInput(DEFAULT_INPUT);
    setResult(null);
    setAgeError("");
  }

  return (
    <div className="grid lg:grid-cols-5 gap-10">
      <form onSubmit={onCalculate} className="lg:col-span-3 space-y-6" noValidate>
        <fieldset className={fieldsetClass}>
          <legend className="text-sm font-semibold text-[var(--color-primary)] mb-3">Your Profile</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="maritalStatus">Marital Status</label>
              <select
                id="maritalStatus"
                className={selectClass}
                value={input.maritalStatus}
                onChange={(e) => set("maritalStatus", e.target.value as MaritalStatus)}
              >
                <option value="single">Single / no accompanying spouse</option>
                <option value="withSpouse">Married / common-law (accompanying)</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                min={17}
                max={99}
                className={selectClass}
                value={input.age}
                onChange={(e) => set("age", Number(e.target.value))}
              />
              {ageError && <p className="text-xs text-red-600 mt-1">{ageError}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className={fieldsetClass}>
          <legend className="text-sm font-semibold text-[var(--color-primary)] mb-3">Education &amp; Language</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="education">Highest Level of Education</label>
              <select id="education" className={selectClass} value={input.education} onChange={(e) => set("education", e.target.value as EducationLevel)}>
                {EDUCATION_OPTIONS.map((k) => (
                  <option key={k} value={k}>{EDUCATION_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="canadianEducation">Canadian Education Credential</label>
              <select
                id="canadianEducation"
                className={selectClass}
                value={input.canadianEducation}
                onChange={(e) => set("canadianEducation", e.target.value as CanadianEducation)}
              >
                <option value="none">None</option>
                <option value="oneOrTwoYear">1–2 year Canadian credential</option>
                <option value="threePlusYear">3+ year Canadian credential</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="firstLang">First Official Language (CLB level)</label>
              <select id="firstLang" className={selectClass} value={input.firstLanguageClb} onChange={(e) => set("firstLanguageClb", e.target.value as ClbLevel)}>
                {CLB_OPTIONS.map((k) => (
                  <option key={k} value={k}>{CLB_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="secondLang">Second Official Language (CLB level)</label>
              <select id="secondLang" className={selectClass} value={input.secondLanguageClb} onChange={(e) => set("secondLanguageClb", e.target.value as ClbLevel)}>
                {CLB_OPTIONS.map((k) => (
                  <option key={k} value={k}>{CLB_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
            <input type="checkbox" className="h-4 w-4" checked={input.frenchNclc7Plus} onChange={(e) => set("frenchNclc7Plus", e.target.checked)} />
            NCLC 7 or higher in French on all four abilities
          </label>
        </fieldset>

        <fieldset className={fieldsetClass}>
          <legend className="text-sm font-semibold text-[var(--color-primary)] mb-3">Work Experience</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="canadianWork">Canadian Work Experience</label>
              <select
                id="canadianWork"
                className={selectClass}
                value={input.canadianWorkYears}
                onChange={(e) => set("canadianWorkYears", Number(e.target.value) as WorkYears)}
              >
                <option value={0}>None</option>
                <option value={1}>1 year</option>
                <option value={2}>2 years</option>
                <option value={3}>3 years</option>
                <option value={4}>4 years</option>
                <option value={5}>5+ years</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="foreignWork">Foreign Work Experience</label>
              <select
                id="foreignWork"
                className={selectClass}
                value={input.foreignWorkYears}
                onChange={(e) => set("foreignWorkYears", e.target.value as ForeignWorkYears)}
              >
                <option value="none">None</option>
                <option value="oneToTwo">1–2 years</option>
                <option value="threePlus">3+ years</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={input.hasCertificateOfQualification}
              onChange={(e) => set("hasCertificateOfQualification", e.target.checked)}
            />
            I hold a certificate of qualification in a trade occupation
          </label>
        </fieldset>

        {input.maritalStatus === "withSpouse" && (
          <fieldset className={fieldsetClass}>
            <legend className="text-sm font-semibold text-[var(--color-primary)] mb-3">Spouse / Partner</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="spouseEducation">Spouse Education</label>
                <select
                  id="spouseEducation"
                  className={selectClass}
                  value={input.spouseEducation || "lessThanSecondary"}
                  onChange={(e) => set("spouseEducation", e.target.value as EducationLevel)}
                >
                  {EDUCATION_OPTIONS.map((k) => (
                    <option key={k} value={k}>{EDUCATION_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="spouseLang">Spouse First Language (CLB)</label>
                <select
                  id="spouseLang"
                  className={selectClass}
                  value={input.spouseFirstLanguageClb || "none"}
                  onChange={(e) => set("spouseFirstLanguageClb", e.target.value as ClbLevel)}
                >
                  {CLB_OPTIONS.map((k) => (
                    <option key={k} value={k}>{CLB_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="spouseWork">Spouse Canadian Work Experience</label>
                <select
                  id="spouseWork"
                  className={selectClass}
                  value={input.spouseCanadianWorkYears ?? 0}
                  onChange={(e) => set("spouseCanadianWorkYears", Number(e.target.value) as WorkYears)}
                >
                  <option value={0}>None</option>
                  <option value={1}>1 year</option>
                  <option value={2}>2 years</option>
                  <option value={3}>3 years</option>
                  <option value={4}>4 years</option>
                  <option value={5}>5+ years</option>
                </select>
              </div>
            </div>
          </fieldset>
        )}

        <fieldset className={fieldsetClass}>
          <legend className="text-sm font-semibold text-[var(--color-primary)] mb-3">Additional Factors</legend>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
              <input type="checkbox" className="h-4 w-4" checked={input.provincialNomination} onChange={(e) => set("provincialNomination", e.target.checked)} />
              I have a provincial or territorial nomination
            </label>
            <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
              <input type="checkbox" className="h-4 w-4" checked={input.siblingInCanada} onChange={(e) => set("siblingInCanada", e.target.checked)} />
              I have a sibling (18+) living in Canada who is a citizen or permanent resident
            </label>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit">Calculate My Score</Button>
          <Button type="button" variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </form>

      <div className="lg:col-span-2">
        <div className="sticky top-28 rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-7">
          {result ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Estimated CRS Score</p>
              <p className="mt-2 font-heading text-5xl font-semibold text-[var(--color-primary)]">
                {result.total}
                <span className="text-lg text-[var(--color-muted)] font-normal"> / {result.maxPossible}</span>
              </p>
              <div className="mt-6 space-y-4">
                {result.sections.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center justify-between text-sm font-medium text-[var(--color-primary)]">
                      <span>{section.title}</span>
                      <span>{section.subtotal}</span>
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {section.items.map((item) => (
                        <li key={item.label} className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                          <span className="pr-3">{item.label}</span>
                          <span className="shrink-0">{item.points}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-7 pt-6 border-t border-black/[0.06]">
                <ButtonLink href="/booking" className="w-full justify-center">
                  Book a Consultation
                </ButtonLink>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Info className="h-8 w-8 text-[var(--color-primary)]/30 mx-auto mb-3" />
              <p className="text-sm text-[var(--color-muted)]">
                Fill in the form and select &ldquo;Calculate My Score&rdquo; to see your estimated CRS score.
              </p>
            </div>
          )}
          <p className="mt-6 text-[11px] text-[var(--color-muted)] leading-relaxed">{CRS_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
