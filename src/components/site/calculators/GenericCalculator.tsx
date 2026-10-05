"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Info, RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { defaultsFromConfig, type CalcResult } from "@/lib/calculators/types";
import { getCalculatorConfig } from "@/lib/calculators/registry";

const inputClass =
  "w-full rounded-[var(--radius-btn)] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all";
const labelClass = "block text-sm font-medium text-[var(--color-ink)] mb-1.5";

/**
 * Takes a `slug` rather than the full config object: a CalculatorConfig
 * carries functions (calculate, showIf), which cannot be passed from a
 * server component (the [slug]/page.tsx route) across to this client
 * component as props. The registry is plain, side-effect-free TS, so it's
 * safe to import and re-look-up the config here on the client instead.
 */
export function GenericCalculator({ slug }: { slug: string }) {
  const config = getCalculatorConfig(slug);
  const [input, setInput] = useState<Record<string, unknown>>(() => (config ? defaultsFromConfig(config) : {}));
  const [result, setResult] = useState<CalcResult | null>(null);

  function set(key: string, value: unknown) {
    setInput((v) => ({ ...v, [key]: value }));
  }

  function onCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setResult(config.calculate(input));
  }

  function onReset() {
    if (!config) return;
    setInput(defaultsFromConfig(config));
    setResult(null);
  }

  if (!config) return null;

  return (
    <div className="grid lg:grid-cols-5 gap-10">
      <form onSubmit={onCalculate} className="lg:col-span-3 space-y-6" noValidate>
        {config.groups.map((group) => {
          if (group.showIf && !group.showIf(input)) return null;
          return (
            <fieldset key={group.title} className="space-y-4">
              <legend className="text-sm font-semibold text-[var(--color-primary)] mb-3">{group.title}</legend>
              <div className="grid sm:grid-cols-2 gap-4">
                {group.fields.map((field) => {
                  if (field.showIf && !field.showIf(input)) return null;
                  const value = input[field.key];

                  if (field.type === "checkbox") {
                    return (
                      <label key={field.key} className="flex items-start gap-2.5 text-sm text-[var(--color-ink)] sm:col-span-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 mt-0.5 shrink-0"
                          checked={Boolean(value)}
                          onChange={(e) => set(field.key, e.target.checked)}
                        />
                        <span>
                          {field.label}
                          {field.help && <span className="block text-xs text-[var(--color-muted)] mt-0.5">{field.help}</span>}
                        </span>
                      </label>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <div key={field.key}>
                        <label className={labelClass} htmlFor={field.key}>{field.label}</label>
                        <select
                          id={field.key}
                          className={inputClass}
                          value={String(value)}
                          onChange={(e) => set(field.key, e.target.value)}
                        >
                          {field.options?.map((opt) => (
                            <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {field.help && <p className="text-xs text-[var(--color-muted)] mt-1">{field.help}</p>}
                      </div>
                    );
                  }

                  return (
                    <div key={field.key}>
                      <label className={labelClass} htmlFor={field.key}>{field.label}</label>
                      <input
                        id={field.key}
                        type="number"
                        min={field.min}
                        max={field.max}
                        className={inputClass}
                        value={Number(value)}
                        onChange={(e) => set(field.key, Number(e.target.value))}
                      />
                      {field.help && <p className="text-xs text-[var(--color-muted)] mt-1">{field.help}</p>}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit">Calculate</Button>
          <Button type="button" variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </form>

      <div className="lg:col-span-2">
        <div className="sticky top-28 rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-7">
          {result ? (
            <>
              {result.mode === "score" ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Estimated Score</p>
                  <p className="mt-2 font-heading text-5xl font-semibold text-[var(--color-primary)]">
                    {result.total}
                    {typeof result.maxPossible === "number" && (
                      <span className="text-lg text-[var(--color-muted)] font-normal"> / {result.maxPossible}</span>
                    )}
                  </p>
                  {result.verdict && (
                    <p
                      className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium ${
                        result.verdictPositive ? "text-emerald-700" : "text-[var(--color-muted)]"
                      }`}
                    >
                      {result.verdictPositive ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {result.verdict}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Eligibility Check</p>
                  <p
                    className={`mt-2 inline-flex items-center gap-2 font-heading text-2xl font-semibold ${
                      result.verdictPositive ? "text-emerald-700" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {result.verdictPositive ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6 text-[var(--color-accent)]" />}
                    {result.verdict}
                  </p>
                </>
              )}

              <div className="mt-6 space-y-4">
                {result.sections.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center justify-between text-sm font-medium text-[var(--color-primary)]">
                      <span>{section.title}</span>
                      <span>{section.subtotal}</span>
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {section.items.map((item) => (
                        <li key={item.label} className="flex items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
                          <span className="pr-3">{item.label}</span>
                          <span className="shrink-0">
                            {result.mode === "eligibility" ? (item.points ? "✓" : "—") : item.points}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {result.notes && result.notes.length > 0 && (
                <div className="mt-6 space-y-2">
                  {result.notes.map((note, i) => (
                    <p key={i} className="text-xs text-[var(--color-muted)] leading-relaxed bg-black/[0.03] rounded-md p-3">
                      {note}
                    </p>
                  ))}
                </div>
              )}

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
                Fill in the form and select &ldquo;Calculate&rdquo; to see your result.
              </p>
            </div>
          )}
          <p className="mt-6 text-[11px] text-[var(--color-muted)] leading-relaxed">{config.disclaimer}</p>
          <p className="mt-3 text-[11px] text-[var(--color-muted)]">
            Source:{" "}
            <a href={config.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-primary)]">
              {config.sourceLabel}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
