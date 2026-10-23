"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, Search, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  calculateOinp,
  CATEGORY_NAMES,
  CATEGORY_POINTS,
  EMPTY_OINP_ANSWERS,
  OINP_CHOICES,
  OINP_GRID_PUBLISHED,
  OINP_GRID_UPDATED,
  OINP_PATHWAYS,
  OINP_REGION_GROUPS,
  OINP_SOURCE_URL,
  oinpMaxScore,
  PHYSICIAN_NOC,
  TEER_GROUPS,
  TEER_POINTS,
  teerGroup,
  type OinpAnswers,
  type OinpChoiceKey,
  type OinpResult,
} from "@/lib/calculators/oinp";
import { normalizeSearchText, searchOccupations, type NocMatch } from "@/lib/calculators/nocSearch";

const selectClass =
  "w-full rounded-[var(--radius-btn)] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all";
const darkInputClass =
  "w-full rounded-[var(--radius-btn)] border border-white/20 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/25 transition-all";

/* ---------- occupation search ---------- */

function OccupationSearch({
  labelledBy,
  pathway,
  teer,
  category,
  picked,
  onPick,
  onClearPick,
  onManualChange,
}: {
  labelledBy: string;
  pathway: OinpAnswers["pathway"];
  teer: string | null;
  category: string | null;
  picked: NocMatch | null;
  onPick: (match: NocMatch) => void;
  onClearPick: () => void;
  onManualChange: (teer: string | null, category: string | null) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [manualOpen, setManualOpen] = useState(false);
  const results = useMemo(() => searchOccupations(query), [query]);
  const showResults = open && normalizeSearchText(query).length >= 2;

  useEffect(() => {
    if (!showResults) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showResults]);

  useEffect(() => {
    if (active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  function choose(match: NocMatch) {
    onPick(match);
    setQuery(match.title);
    setOpen(false);
    setActive(-1);
  }

  function onQueryChange(value: string) {
    setQuery(value);
    setOpen(true);
    setActive(-1);
    // Typing over a chosen occupation drops its points until a new one is picked.
    if (picked) onClearPick();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!showResults) setOpen(true);
      else if (results.length) setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length) setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === "Enter" && showResults) {
      const match = active >= 0 ? results[active] : results.length === 1 ? results[0] : undefined;
      if (match) {
        event.preventDefault();
        choose(match);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // Manual answers replace any searched occupation, so the two never disagree.
  function onManual(nextTeer: string | null, nextCategory: string | null) {
    setQuery("");
    onManualChange(nextTeer, nextCategory);
  }

  const pickedTeer = picked?.code[1];
  const pickedCategory = picked?.code[0];
  const pathwayMismatch =
    pickedTeer !== undefined &&
    ((pathway === "skilled" && Number(pickedTeer) >= 4) || (pathway === "essential" && Number(pickedTeer) <= 3));

  return (
    <div>
      <div ref={rootRef} className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
          aria-hidden="true"
        />
        <input
          type="text"
          role="combobox"
          aria-labelledby={labelledBy}
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showResults && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder="Registered nurse, welder, truck driver…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => {
            if (!picked) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cn(selectClass, "py-3 pl-10 pr-10 text-[0.95rem]")}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear occupation"
            onClick={() => onQueryChange("")}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-black/[0.04] hover:text-[var(--color-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {showResults && results.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-[var(--radius-btn)] border border-black/10 bg-[var(--color-surface)] py-1 shadow-brand-lg"
          >
            {results.map((match, i) => (
              <li
                key={match.code}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // Keep focus in the input so the list doesn't close before the click lands.
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(match)}
                onMouseMove={() => setActive(i)}
                className={cn(
                  "cursor-pointer border-b border-black/[0.05] px-4 py-2.5 last:border-b-0",
                  i === active && "bg-[var(--color-accent)]/10"
                )}
              >
                <span className="block text-sm font-medium text-[var(--color-ink)]">{match.title}</span>
                <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                  <span className="font-semibold text-[var(--color-primary)]">NOC {match.code}</span> · TEER {match.code[1]} ·{" "}
                  {CATEGORY_NAMES[match.code[0]]}
                </span>
                {match.example && (
                  <span className="mt-0.5 block text-xs text-[var(--color-muted)]">Includes &ldquo;{match.example}&rdquo;</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {showResults && results.length === 0 && (
          <p
            role="status"
            className="absolute inset-x-0 top-full z-20 mt-1.5 rounded-[var(--radius-btn)] border border-black/10 bg-[var(--color-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--color-muted)] shadow-brand-lg"
          >
            No match. Try different wording, or set your TEER level and category yourself below.
          </p>
        )}
      </div>

      {picked && pickedTeer !== undefined && pickedCategory !== undefined && (
        <div className="mt-3 rounded-[var(--radius-btn)] border border-emerald-700/25 bg-emerald-700/[0.06] px-4 py-3">
          <p className="flex items-start gap-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {picked.title}
          </p>
          <p className="mt-1 pl-6 text-xs leading-relaxed text-emerald-900/80">
            NOC {picked.code} · TEER {pickedTeer} ({TEER_POINTS[pickedTeer]} points) · {CATEGORY_NAMES[pickedCategory]} (
            {CATEGORY_POINTS[pickedCategory]} points)
          </p>
          {pathwayMismatch && (
            <p className="mt-2 pl-6 text-xs leading-relaxed text-[var(--color-ink)]">
              This is a TEER {pickedTeer} occupation, so it belongs under the{" "}
              {pathway === "skilled" ? "essential (TEER 4 or 5)" : "skilled (TEER 0 to 3)"} pathway. Your points are the
              same, but the eligibility rules differ — switch the pathway above if this is your job offer.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        aria-expanded={manualOpen}
        onClick={() => setManualOpen((v) => !v)}
        className="mt-3.5 text-sm font-semibold text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-accent)]"
      >
        {manualOpen ? "Hide manual TEER and category" : "Not listed? Set TEER and category yourself"}
      </button>

      {manualOpen && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor={`${listId}-teer`}>
              TEER level <span className="font-normal text-[var(--color-muted)]">(second digit of your NOC)</span>
            </label>
            <select
              id={`${listId}-teer`}
              className={selectClass}
              value={teer === null ? "" : teerGroup(teer)}
              onChange={(event) => onManual(event.target.value || null, category)}
            >
              <option value="">Select TEER level</option>
              {TEER_GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label} ({TEER_POINTS[group.value]} points)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor={`${listId}-category`}>
              Occupational category <span className="font-normal text-[var(--color-muted)]">(first digit)</span>
            </label>
            <select
              id={`${listId}-category`}
              className={selectClass}
              value={category ?? ""}
              onChange={(event) => onManual(teer, event.target.value || null)}
            >
              <option value="">Select category</option>
              {Object.keys(CATEGORY_NAMES)
                .sort((a, b) => CATEGORY_POINTS[b] - CATEGORY_POINTS[a])
                .map((digit) => (
                  <option key={digit} value={digit}>
                    {CATEGORY_NAMES[digit]} ({CATEGORY_POINTS[digit]} points)
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- form building blocks ---------- */

function FactorCard({
  id,
  title,
  max,
  description,
  children,
}: {
  id: string;
  title: string;
  max?: number;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)] p-5 shadow-brand-sm sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 id={id} className="font-heading text-lg font-semibold text-[var(--color-primary)]">
          {title}
        </h3>
        {max !== undefined && (
          <span className="shrink-0 rounded-full bg-[var(--color-accent)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
            Max {max} points
          </span>
        )}
      </div>
      <p className="mb-4 mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
      {children}
    </section>
  );
}

function ChoiceList({
  name,
  labelledBy,
  options,
  value,
  onChange,
}: {
  name: string;
  labelledBy: string;
  options: { label: string; hint?: string; badge: string }[];
  value: number | undefined;
  onChange: (index: number) => void;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="space-y-2.5">
      {options.map((option, i) => {
        const checked = value === i;
        return (
          <label
            key={option.label}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-[var(--radius-btn)] border px-3.5 py-3 transition-colors",
              checked
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/[0.04]"
                : "border-black/10 hover:border-black/25"
            )}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(i)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span className="flex-1 text-sm leading-snug text-[var(--color-ink)]">
              {option.label}
              {option.hint && <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{option.hint}</span>}
            </span>
            <span className="shrink-0 pl-2 text-xs font-semibold text-[var(--color-primary)]">{option.badge}</span>
          </label>
        );
      })}
    </div>
  );
}

function pointsBadge(points: number) {
  return points > 0 ? `+${points}` : "0";
}

function ChoiceSelect({
  labelledBy,
  choice,
  placeholder,
  value,
  onChange,
}: {
  labelledBy: string;
  choice: Exclude<OinpChoiceKey, "region">;
  placeholder: string;
  value: number | undefined;
  onChange: (index: number | undefined) => void;
}) {
  return (
    <select
      aria-labelledby={labelledBy}
      className={selectClass}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
    >
      <option value="">{placeholder}</option>
      {OINP_CHOICES[choice].map((option, i) => (
        <option key={option.label} value={i}>
          {option.label} ({option.points} points)
        </option>
      ))}
    </select>
  );
}

/* ---------- score panel ---------- */

function verdictText(result: OinpResult | null) {
  if (!result) return "Choose a pathway to start scoring.";
  const factors = result.rows.length;
  if (result.answeredCount < factors) {
    return `Answered ${result.answeredCount} of ${factors}. Complete every factor for an accurate estimate.`;
  }
  return `All ${factors} factors answered. This is an estimate, not an eligibility decision.`;
}

function CallbackForm({
  getSummary,
  contactPhone,
  contactEmail,
}: {
  getSummary: () => string;
  contactPhone?: string;
  contactEmail?: string;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string }>({
    kind: "idle",
  });

  const fallback = [contactPhone && `call ${contactPhone}`, contactEmail && `email ${contactEmail}`].filter(Boolean).join(" or ");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (fullName.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) || phone.replace(/\D/g, "").length < 7) {
      setStatus({ kind: "error", message: "Add your name, email and phone number so we can call you back." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/public/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          serviceOfInterest: "OINP Calculator — callback request",
          message: getSummary(),
          preferredContactMethod: "Phone",
          companyWebsite,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "That did not go through.");
      setStatus({ kind: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "That did not go through.";
      setStatus({ kind: "error", message: fallback ? `${message} Please ${fallback} and we'll take it from there.` : message });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="mt-5 border-t border-white/15 pt-5" role="status">
        <p className="flex items-start gap-2 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Callback requested
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/75">
          Thank you. Our team will call you to walk through your result and your next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-5 space-y-3 border-t border-white/15 pt-5">
      <p className="text-sm font-semibold">Prefer a call back?</p>
      <div>
        <label htmlFor="oinp-callback-name" className="mb-1.5 block text-xs font-semibold text-white/80">
          Name
        </label>
        <input
          id="oinp-callback-name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className={darkInputClass}
        />
      </div>
      <div>
        <label htmlFor="oinp-callback-email" className="mb-1.5 block text-xs font-semibold text-white/80">
          Email
        </label>
        <input
          id="oinp-callback-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={darkInputClass}
        />
      </div>
      <div>
        <label htmlFor="oinp-callback-phone" className="mb-1.5 block text-xs font-semibold text-white/80">
          Phone
        </label>
        <input
          id="oinp-callback-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={darkInputClass}
        />
      </div>
      {/* honeypot field — hidden from real users */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        value={companyWebsite}
        onChange={(event) => setCompanyWebsite(event.target.value)}
      />
      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="w-full rounded-[var(--radius-btn)] border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10 disabled:opacity-60"
      >
        {status.kind === "sending" ? "Requesting…" : "Request a callback"}
      </button>
      <p className="text-xs leading-relaxed text-white/55">
        We&apos;ll call you back with your score, your full points breakdown and the gaps we can help you close.
      </p>
      {status.kind === "error" && (
        <p role="alert" className="text-xs font-semibold leading-relaxed text-red-300">
          {status.message}
        </p>
      )}
    </form>
  );
}

/* ---------- calculator ---------- */

export function OinpCalculator({ contactPhone, contactEmail }: { contactPhone?: string; contactEmail?: string }) {
  const idBase = useId();
  const topRef = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<OinpAnswers>(EMPTY_OINP_ANSWERS);
  const [picked, setPicked] = useState<NocMatch | null>(null);
  // Bumped on reset so the occupation search remounts with an empty box.
  const [resetCount, setResetCount] = useState(0);

  const result = calculateOinp(answers);
  const { pathway, choices } = answers;
  const jobOffer = pathway === "skilled" || pathway === "essential";
  const max = result?.maxPossible ?? oinpMaxScore("skilled");
  const total = result?.total ?? 0;
  const id = (name: string) => `${idBase}-${name}`;

  function setChoice(key: OinpChoiceKey, index: number | undefined) {
    setAnswers((current) => ({ ...current, choices: { ...current.choices, [key]: index } }));
  }

  function onReset() {
    setAnswers(EMPTY_OINP_ANSWERS);
    setPicked(null);
    setResetCount((n) => n + 1);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function radioOptions(choice: OinpChoiceKey) {
    return OINP_CHOICES[choice].map((option) => ({ label: option.label, badge: pointsBadge(option.points) }));
  }

  // The plain-text answer sheet sent with a callback request, so the team sees where every point came from.
  function buildSummary() {
    if (!result || !pathway) return "Callback request from the OINP calculator (no answers entered yet).";
    const answer = (key: OinpChoiceKey) => {
      const index = choices[key];
      if (index === undefined) return null;
      const option = OINP_CHOICES[key][index];
      return `${option.label} (${option.points} points)`;
    };
    const occupation =
      pathway === "physician"
        ? `Self-employed physician — TEER ${PHYSICIAN_NOC.teer}, ${CATEGORY_NAMES[PHYSICIAN_NOC.category]}`
        : picked
          ? `${picked.title} (NOC ${picked.code} — TEER ${picked.code[1]}, ${CATEGORY_NAMES[picked.code[0]]})`
          : [
              answers.teer !== null && TEER_GROUPS.find((group) => group.value === teerGroup(answers.teer ?? ""))?.label,
              answers.category !== null && CATEGORY_NAMES[answers.category],
            ]
              .filter(Boolean)
              .join("; ") || null;
    const lines: [string, string | null][] = [
      ["Pathway", OINP_PATHWAYS.find((p) => p.value === pathway)?.label ?? pathway],
      ["Occupation", occupation],
      ...(jobOffer
        ? ([
            ["Hourly wage", answer("wage")],
            ["Experience in the job offer position", answer("offerExperience")],
            ["Experience anywhere in Ontario", answer("ontarioExperience")],
          ] as [string, string | null][])
        : ([["Medical practice in Ontario", answer("physicianPractice")]] as [string, string | null][])),
      ["Canadian earnings", answer("earnings")],
      ["Status in Canada", answer("status")],
      ["Highest education", answer("education")],
      ["Canadian credentials", answer("canadianCredentials")],
      ["Language level", answer("clb")],
      ["Official languages", answer("officialLanguages")],
      ["Work location", answer("region")],
    ];
    return [
      "Callback request from the OINP calculator.",
      `Estimated score: ${result.total} / ${result.maxPossible} (${result.answeredCount} of ${result.rows.length} factors answered)`,
      "",
      ...lines.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`),
    ].join("\n");
  }

  return (
    <div ref={topRef} className="scroll-mt-32">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <FactorCard id={id("pathway")} title="Pathway" description="This sets which factors are scored and your maximum score.">
            <ChoiceList
              name={id("pathway-choice")}
              labelledBy={id("pathway")}
              options={OINP_PATHWAYS.map((p) => ({ label: p.label, hint: p.hint, badge: `${oinpMaxScore(p.value)} max` }))}
              value={pathway ? OINP_PATHWAYS.findIndex((p) => p.value === pathway) : undefined}
              onChange={(i) => setAnswers((current) => ({ ...current, pathway: OINP_PATHWAYS[i].value }))}
            />
          </FactorCard>

          {pathway && (
            <div className="animate-fade-in-up space-y-5">
              <FactorCard
                id={id("occupation")}
                title="Occupation"
                max={19}
                description={
                  pathway === "physician"
                    ? "Ontario prepopulates this for self-employed physicians."
                    : "Search your job title. Your NOC code sets both your TEER level and your occupational category, so this one answer scores two factors."
                }
              >
                {pathway === "physician" ? (
                  <div className="rounded-[var(--radius-btn)] border border-emerald-700/25 bg-emerald-700/[0.06] px-4 py-3">
                    <p className="flex items-start gap-2 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      Physician — NOC 31100, 31101 or 31102
                    </p>
                    <p className="mt-1 pl-6 text-xs leading-relaxed text-emerald-900/80">
                      TEER 1 ({TEER_POINTS[PHYSICIAN_NOC.teer]} points) · {CATEGORY_NAMES[PHYSICIAN_NOC.category]} (
                      {CATEGORY_POINTS[PHYSICIAN_NOC.category]} points)
                    </p>
                  </div>
                ) : (
                  <OccupationSearch
                    key={resetCount}
                    labelledBy={id("occupation")}
                    pathway={pathway}
                    teer={answers.teer}
                    category={answers.category}
                    picked={picked}
                    onPick={(match) => {
                      setPicked(match);
                      setAnswers((current) => ({ ...current, teer: match.code[1], category: match.code[0] }));
                    }}
                    onClearPick={() => {
                      setPicked(null);
                      setAnswers((current) => ({ ...current, teer: null, category: null }));
                    }}
                    onManualChange={(teer, category) => {
                      setPicked(null);
                      setAnswers((current) => ({ ...current, teer, category }));
                    }}
                  />
                )}
              </FactorCard>

              {jobOffer ? (
                <>
                  <FactorCard
                    id={id("wage")}
                    title="Hourly Wage"
                    max={15}
                    description="The hourly wage stated on your job offer, before deductions."
                  >
                    <ChoiceSelect
                      labelledBy={id("wage")}
                      choice="wage"
                      placeholder="Select a wage band"
                      value={choices.wage}
                      onChange={(i) => setChoice("wage", i)}
                    />
                  </FactorCard>

                  <FactorCard
                    id={id("offer-experience")}
                    title="Experience in the Job Offer Position"
                    max={18}
                    description="Months worked full-time in the exact position named on your job offer."
                  >
                    <ChoiceSelect
                      labelledBy={id("offer-experience")}
                      choice="offerExperience"
                      placeholder="Select experience"
                      value={choices.offerExperience}
                      onChange={(i) => setChoice("offerExperience", i)}
                    />
                    <p className="mt-3 rounded-[var(--radius-btn)] bg-black/[0.03] px-4 py-3 text-xs leading-relaxed text-[var(--color-muted)]">
                      Ontario only scores your experience anywhere in Ontario (below) if you have less than 6 months in the
                      job offer position. The two are never added together, so the breakdown shows one experience line.
                    </p>
                  </FactorCard>

                  <FactorCard
                    id={id("ontario-experience")}
                    title="Experience Anywhere in Ontario"
                    max={12}
                    description="Full-time (or part-time equivalent) work anywhere in Ontario."
                  >
                    <ChoiceSelect
                      labelledBy={id("ontario-experience")}
                      choice="ontarioExperience"
                      placeholder="Select experience"
                      value={choices.ontarioExperience}
                      onChange={(i) => setChoice("ontarioExperience", i)}
                    />
                  </FactorCard>
                </>
              ) : (
                <FactorCard
                  id={id("practice")}
                  title="Medical Practice in Ontario"
                  max={18}
                  description="Cumulative months of medical practice in Ontario. It does not need to be continuous."
                >
                  <ChoiceSelect
                    labelledBy={id("practice")}
                    choice="physicianPractice"
                    placeholder="Select experience"
                    value={choices.physicianPractice}
                    onChange={(i) => setChoice("physicianPractice", i)}
                  />
                </FactorCard>
              )}

              <FactorCard
                id={id("earnings")}
                title="Canadian Earnings History"
                max={10}
                description="Your highest single year of earnings on a CRA Notice of Assessment from the last five years."
              >
                <ChoiceSelect
                  labelledBy={id("earnings")}
                  choice="earnings"
                  placeholder="Select an earnings band"
                  value={choices.earnings}
                  onChange={(i) => setChoice("earnings", i)}
                />
              </FactorCard>

              <FactorCard
                id={id("status")}
                title="Status in Canada"
                max={10}
                description="Your current legal status in Canada. The permit must be valid."
              >
                <ChoiceList
                  name={id("status-choice")}
                  labelledBy={id("status")}
                  options={radioOptions("status")}
                  value={choices.status}
                  onChange={(i) => setChoice("status", i)}
                />
              </FactorCard>

              <FactorCard
                id={id("education")}
                title="Highest Level of Education"
                max={10}
                description="Only your single highest completed credential counts. A credential from outside Canada needs an Educational Credential Assessment (ECA)."
              >
                <ChoiceSelect
                  labelledBy={id("education")}
                  choice="education"
                  placeholder="Select credential"
                  value={choices.education}
                  onChange={(i) => setChoice("education", i)}
                />
              </FactorCard>

              <FactorCard
                id={id("canadian-credentials")}
                title="Canadian Education Credentials"
                max={10}
                description="Post-secondary credentials from an eligible Canadian institution, each at least one year of full-time study. Scored on top of your highest credential above."
              >
                <ChoiceList
                  name={id("canadian-credentials-choice")}
                  labelledBy={id("canadian-credentials")}
                  options={radioOptions("canadianCredentials")}
                  value={choices.canadianCredentials}
                  onChange={(i) => setChoice("canadianCredentials", i)}
                />
              </FactorCard>

              <FactorCard
                id={id("clb")}
                title="Language Level"
                max={15}
                description="Use your stronger official language test, then take your lowest score across listening, reading, writing and speaking. Academic and One Skill Retake tests aren't accepted."
              >
                <ChoiceSelect
                  labelledBy={id("clb")}
                  choice="clb"
                  placeholder="Select CLB level"
                  value={choices.clb}
                  onChange={(i) => setChoice("clb", i)}
                />
              </FactorCard>

              <FactorCard
                id={id("official-languages")}
                title="Knowledge of Official Languages"
                max={10}
                description="Scored on top of your CLB level above."
              >
                <ChoiceList
                  name={id("official-languages-choice")}
                  labelledBy={id("official-languages")}
                  options={radioOptions("officialLanguages")}
                  value={choices.officialLanguages}
                  onChange={(i) => setChoice("officialLanguages", i)}
                />
              </FactorCard>

              <FactorCard
                id={id("region")}
                title="Work Location"
                max={15}
                description={
                  pathway === "physician"
                    ? "Use the Ontario practice address on your OHIP billing number registration."
                    : "Use the work location on your job offer, not your home address."
                }
              >
                <select
                  aria-labelledby={id("region")}
                  className={selectClass}
                  value={choices.region ?? ""}
                  onChange={(event) => setChoice("region", event.target.value === "" ? undefined : Number(event.target.value))}
                >
                  <option value="">Select a census division</option>
                  {OINP_REGION_GROUPS.map((group) => (
                    <optgroup key={group.label} label={`${group.label} — ${group.points} points`}>
                      {group.options.map((option) => (
                        <option key={option.index} value={option.index}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </FactorCard>
            </div>
          )}

          {/* Small screens: keep the running total in view while answering. */}
          {result && (
            <div className="sticky bottom-3 z-10 lg:hidden">
              <a
                href="#oinp-score"
                className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] bg-[var(--color-dark)] px-5 py-3 text-white shadow-brand-lg"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">Your OINP score</span>
                <span className="font-heading text-2xl font-semibold">
                  {total}
                  <span className="text-sm font-normal text-white/60"> / {max}</span>
                </span>
              </a>
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28" aria-label="Your OINP score">
          <div
            id="oinp-score"
            className="scroll-mt-32 rounded-[var(--radius-card)] bg-[linear-gradient(160deg,var(--color-dark)_0%,var(--color-secondary)_60%,var(--color-primary)_100%)] p-6 text-white shadow-brand sm:p-7"
          >
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Your OINP Score</p>
            <p className="mt-2 text-center font-heading text-7xl font-semibold leading-none">{total}</p>
            <p className="mt-2 text-center text-sm text-white/60">out of {max}</p>
            <div
              role="progressbar"
              aria-label="Score out of the maximum"
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={total}
              className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15"
            >
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300 ease-out"
                style={{ width: `${(total / max) * 100}%` }}
              />
            </div>
            <p className="mt-5 rounded-[var(--radius-btn)] bg-white/[0.08] px-4 py-3 text-sm leading-relaxed text-white/85">
              {verdictText(result)}
            </p>

            {result && (
              <dl className="mt-4 divide-y divide-white/10 text-[0.8rem]">
                {result.rows.map((row) => (
                  <div key={row.key} className="flex justify-between gap-3 py-1.5">
                    <dt className="text-white/75">{row.label}</dt>
                    <dd
                      className={cn(
                        "whitespace-nowrap font-semibold",
                        row.answered && row.points > 0 ? "text-emerald-300" : "text-white"
                      )}
                    >
                      {row.points} / {row.max}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <div
              aria-live="polite"
              className="mt-2 flex justify-between gap-3 border-t border-white/25 pt-3 text-sm font-bold"
            >
              <span>Estimated total</span>
              <span>
                {total} / {max}
              </span>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold uppercase tracking-wider text-white/55 transition-colors hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset all answers
            </button>
          </div>

          <div className="rounded-[var(--radius-card)] bg-[var(--color-dark)] p-6 text-white shadow-brand">
            <h3 className="font-heading text-lg font-semibold leading-snug">Get a plan for these points</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/75">
              Our licensed consultant will check your profile against the Ontario Workforce Priority stream requirements,
              confirm your NOC, and tell you whether this score is worth acting on.
            </p>
            <ButtonLink href="/booking" variant="secondary" className="mt-4 w-full justify-center">
              Book a Consultation
            </ButtonLink>
            <Link
              href="/contact"
              className="mt-2.5 flex w-full items-center justify-center rounded-[var(--radius-btn)] border border-white/30 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-white/60 hover:bg-white/10"
            >
              Contact Us
            </Link>
            <CallbackForm getSummary={buildSummary} contactPhone={contactPhone} contactEmail={contactEmail} />
          </div>
        </aside>
      </div>

      <div className="mt-10 rounded-r-[var(--radius-card)] border border-l-4 border-black/[0.06] border-l-[var(--color-accent)] bg-[var(--color-surface)] p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--color-primary)]">Before you rely on this score</h2>
        <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-[var(--color-muted)]">
          <p>
            Ontario published this scoring grid on <strong className="text-[var(--color-ink)]">{OINP_GRID_PUBLISHED}</strong>{" "}
            and last updated it on <strong className="text-[var(--color-ink)]">{OINP_GRID_UPDATED}</strong>, and it can
            change at any time. A high score here does not guarantee an invitation to apply.
          </p>
          <p>
            This calculator estimates points only. It does not check the stream&apos;s minimum requirements for your job
            offer, work experience, language and education, all of which must be met before any points count. It is
            general information, not legal or immigration advice, and does not create a consultant–client relationship.
            Speak with our licensed consultant before acting on any number you see here.
          </p>
          <p>
            Occupation data: National Occupational Classification (NOC) 2021 Version 1.0, Statistics Canada, used under
            the Statistics Canada Open Licence. Always confirm current values on{" "}
            <a
              href={OINP_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-accent)]"
            >
              ontario.ca
            </a>
            . We are not affiliated with the Government of Ontario.
          </p>
        </div>
      </div>
    </div>
  );
}
