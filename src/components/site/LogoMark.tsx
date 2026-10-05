/**
 * Temporary brand mark for Swashray Immigration Services Inc.
 * Concept: an upward, forward-leaning path arriving at a destination point —
 * representing a guided journey — built from simple geometric strokes so it
 * reads cleanly at small sizes (favicon) and large sizes (hero/header).
 * Replace via Admin → Site Settings → Branding once a final logo is ready.
 */
export function LogoMark({ className, light = false }: { className?: string; light?: boolean }) {
  const stroke = light ? "#ffffff" : "var(--color-primary)";
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="24" cy="24" r="22" stroke={stroke} strokeWidth="2" />
      <path
        d="M13 30 L21 20 L27 26 L35 14"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="14" r="3.2" fill="var(--color-accent)" />
    </svg>
  );
}

export function LogoWordmark({
  className,
  subline = true,
  tagline = true,
  light = false,
}: {
  className?: string;
  subline?: boolean;
  /** The small "Canadian Immigration Consultancy" descriptor under the name. */
  tagline?: boolean;
  light?: boolean;
}) {
  return (
    <span className={className}>
      <span
        className={`font-heading text-2xl sm:text-[1.75rem] font-semibold tracking-tight leading-none block text-center ${
          light ? "text-white" : "text-[var(--color-primary)]"
        }`}
      >
        Swashray
      </span>
      {subline && (
        <span
          className={`text-xs sm:text-sm font-medium tracking-[0.2em] uppercase leading-none block mt-1.5 text-center ${
            light ? "text-white/60" : "text-[var(--color-muted)]"
          }`}
        >
          Immigration Services
        </span>
      )}
      {tagline && (
        <span
          className={`text-[10px] sm:text-[11px] font-medium tracking-wide leading-none block mt-1 text-center ${
            light ? "text-white/45" : "text-[var(--color-muted)]/80"
          }`}
        >
          Canadian Immigration Consultancy
        </span>
      )}
    </span>
  );
}
