import Image from "next/image";
import { mediaUrl } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

/**
 * Displays the licensed-consultant credential (RCIC-IRB) prominently.
 * Reuses whatever image is set as the site logo (Admin → Site Settings →
 * Branding) so it stays in sync with a single admin-managed image, plus an
 * admin-editable caption (Admin → Site Settings → Branding → Trust Badge Text).
 */
export function TrustBadge({
  logoMediaId,
  text,
  businessName,
  variant = "light",
}: {
  logoMediaId?: string | null;
  text: string;
  businessName: string;
  variant?: "light" | "dark";
}) {
  const url = mediaUrl(logoMediaId);

  return (
    <div
      className={`flex items-center gap-4 rounded-[var(--radius-card)] border px-6 py-5 ${
        variant === "dark" ? "border-white/15 bg-white/5" : "border-black/[0.06] bg-[var(--color-surface)]"
      }`}
    >
      <span className="shrink-0 flex h-12 w-12 items-center justify-center">
        {url ? (
          <Image src={url} alt={businessName} width={48} height={48} className="h-full w-full object-contain" />
        ) : (
          <ShieldCheck className={`h-8 w-8 ${variant === "dark" ? "text-white/70" : "text-[var(--color-primary)]/60"}`} />
        )}
      </span>
      <p className={`text-sm leading-relaxed ${variant === "dark" ? "text-white/80" : "text-[var(--color-muted)]"}`}>{text}</p>
    </div>
  );
}
