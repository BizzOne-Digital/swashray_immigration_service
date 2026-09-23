/**
 * A fully original, code-drawn illustration for the homepage Calculator
 * teaser — a decorative gauge/dial motif plus generic, real program-name
 * chips (Express Entry, PNP, Family Class are official Canadian immigration
 * program names, not client-specific claims). No numeric score is implied
 * or fabricated; this is purely decorative so the section reads as rich and
 * on-brand rather than showing a bare icon in a circle. Colors are driven
 * entirely by the live theme CSS variables.
 */
export function ScoreGaugeIllustration() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-black/[0.06] shadow-lg p-8">
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="w-56 h-auto">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(13,61,61,0.08)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 150 34"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <circle cx="150" cy="34" r="7" fill="var(--color-primary)" />
          </svg>
        </div>
        <p className="mt-2 text-center font-heading text-lg font-semibold text-[var(--color-primary)]">
          Estimate Your Score
        </p>
        <p className="mt-1 text-center text-xs text-[var(--color-muted)]">
          Free · No sign-up · 2 minutes
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["Express Entry", "PNP", "Family Class"].map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-primary)]/[0.06] text-[var(--color-primary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      {/* floating accent dots for visual richness */}
      <span className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[var(--color-accent)]/25" aria-hidden="true" />
      <span className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-[var(--color-primary)]/[0.06]" aria-hidden="true" />
    </div>
  );
}
