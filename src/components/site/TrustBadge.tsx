import { RcicIrbLogo } from "@/components/site/RcicIrbLogo";

/**
 * Displays the licensed-consultant credential prominently: the official
 * RCIC-IRB designation logo (public/images/insignia/) beside an
 * admin-editable caption (Admin → Site Settings → Branding → Trust Badge Text).
 * Deliberately independent of the site logo, so changing the Swashray brand
 * logo can never replace or hide the regulatory designation.
 */
export function TrustBadge({
  text,
  variant = "light",
  stacked = false,
}: {
  text: string;
  variant?: "light" | "dark";
  /** Logo above the caption — for narrow columns such as a sidebar. */
  stacked?: boolean;
}) {
  return (
    <div
      className={`flex gap-4 rounded-[var(--radius-card)] border px-5 py-5 sm:px-6 ${
        stacked ? "flex-col items-center text-center" : "flex-col sm:flex-row sm:items-center sm:gap-5"
      } ${variant === "dark" ? "border-white/15 bg-white/5" : "border-black/[0.06] bg-[var(--color-surface)]"}`}
    >
      <span
        className={`shrink-0 rounded-md bg-white px-3 py-2 ring-1 ring-black/[0.06] ${stacked ? "" : "self-start sm:self-center"}`}
      >
        <RcicIrbLogo className={stacked ? "h-14" : "h-11 sm:h-12"} sizes="220px" />
      </span>
      <p className={`text-sm leading-relaxed ${variant === "dark" ? "text-white/80" : "text-[var(--color-muted)]"}`}>{text}</p>
    </div>
  );
}
