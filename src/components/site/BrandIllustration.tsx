import { Icon } from "@/components/ui/IconMap";

/**
 * A fully original, code-drawn illustration used wherever a page has no
 * real client-supplied photo yet (hero, About page intro/approach). It is
 * NOT a photo, a stock image, or anything sourced from a reference site —
 * every shape here is plain SVG/CSS drawn from scratch, colored entirely
 * from the live theme CSS variables so it automatically stays on-brand if
 * the admin changes the color palette. This exists specifically so the
 * site looks intentional and professional rather than showing a bare
 * placeholder icon while real photography is pending.
 *
 * `tone`:
 *  - "light"  — for use on a dark/primary-colored background (hero)
 *  - "muted"  — for use on a light/surface background (About page)
 */
export function BrandIllustration({
  icon,
  tone = "muted",
  className,
}: {
  icon: string;
  tone?: "light" | "muted";
  className?: string;
}) {
  const isLight = tone === "light";
  const ringColor = isLight ? "rgba(255,255,255,0.35)" : "var(--color-primary)";
  const dotColor = isLight ? "rgba(255,255,255,0.5)" : "var(--color-accent)";
  const arcColor = isLight ? "rgba(255,255,255,0.25)" : "rgba(14,14,16,0.22)";
  const blobFill = isLight ? "rgba(200,162,74,0.18)" : "var(--color-accent)";
  const badgeBg = isLight ? "rgba(255,255,255,0.12)" : "var(--color-primary)";
  const badgeRing = isLight ? "rgba(255,255,255,0.3)" : "var(--color-accent)";
  const leafColor = isLight ? "rgba(255,255,255,0.08)" : "rgba(14,14,16,0.1)";

  return (
    <div className={`relative h-full w-full overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {/* soft accent blob, top-right */}
      <div
        className="absolute -top-10 -right-10 h-56 w-56 rounded-full blur-2xl"
        style={{ background: blobFill, opacity: isLight ? 1 : 0.38 }}
      />

      {/* watermark maple leaf, bottom-right, oversized + faint */}
      <svg
        viewBox="0 0 100 100"
        className="absolute -bottom-6 -right-6 h-40 w-40"
        style={{ color: leafColor }}
        fill="currentColor"
      >
        <path d="M50 4 L56 22 L72 14 L67 30 L86 30 L72 42 L82 54 L64 52 L66 70 L52 58 L50 96 L48 58 L34 70 L36 52 L18 54 L28 42 L14 30 L33 30 L28 14 L44 22 Z" />
      </svg>

      {/* dashed orbit arc suggesting motion/progress */}
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
        <ellipse
          cx="200"
          cy="150"
          rx="150"
          ry="100"
          fill="none"
          stroke={arcColor}
          strokeWidth="1.5"
          strokeDasharray="4 7"
        />
      </svg>

      {/* small floating accent dots */}
      <span className="absolute left-[18%] top-[22%] h-2 w-2 rounded-full" style={{ background: dotColor }} />
      <span className="absolute right-[24%] top-[64%] h-1.5 w-1.5 rounded-full" style={{ background: dotColor, opacity: 0.7 }} />
      <span className="absolute left-[30%] bottom-[18%] h-1.5 w-1.5 rounded-full" style={{ background: dotColor, opacity: 0.5 }} />

      {/* centered badge with the semantic icon */}
      <div className="relative h-full w-full flex items-center justify-center">
        <span
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: badgeBg, boxShadow: `0 0 0 1px ${badgeRing}, 0 12px 32px -8px ${isLight ? "rgba(0,0,0,0.35)" : "rgba(14,14,16,0.4)"}` }}
        >
          <Icon name={icon} className="h-10 w-10 text-white" />
        </span>
        <span
          className="absolute h-32 w-32 rounded-full"
          style={{ boxShadow: `0 0 0 1px ${ringColor}` }}
        />
        <span
          className="absolute h-40 w-40 rounded-full"
          style={{ boxShadow: `0 0 0 1px ${isLight ? "rgba(255,255,255,0.15)" : "rgba(14,14,16,0.12)"}` }}
        />
      </div>
    </div>
  );
}
