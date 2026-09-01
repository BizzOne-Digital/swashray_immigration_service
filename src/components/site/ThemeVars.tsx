import type { IThemeSettings } from "@/lib/models/ThemeSettings";
import type { CSSProperties } from "react";

const RADIUS_MAP: Record<IThemeSettings["borderRadius"], string> = {
  none: "0.15rem",
  small: "0.35rem",
  medium: "0.85rem",
  large: "1.5rem",
};

/** Builds the inline CSS-variable override object applied at the top of the public site. */
export function buildThemeStyle(theme: IThemeSettings): CSSProperties {
  return {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-accent": theme.colors.accent,
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-ink": theme.colors.text,
    "--color-muted": theme.colors.muted,
    "--radius-card": RADIUS_MAP[theme.borderRadius] ?? RADIUS_MAP.medium,
    "--font-heading": theme.headingFont === "sans" ? "var(--font-manrope)" : "var(--font-playfair)",
  } as CSSProperties;
}

export function buttonRadiusClass(buttonStyle: IThemeSettings["buttonStyle"]): string {
  if (buttonStyle === "pill") return "rounded-full";
  return "rounded-[var(--radius-btn)]";
}
