import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The official RCIC-IRB (Regulated Canadian Immigration Consultant) designation
 * logo supplied by the client — the original file and this web copy live in
 * public/images/insignia/. It is a regulatory credential mark, so it's always
 * shown as-is (never recoloured, cropped, or swapped for the Swashray brand
 * logo), on a white background so its grey text stays legible on dark sections.
 */
export const RCIC_IRB_LOGO_SRC = "/images/insignia/rcic-irb-logo.png";
export const RCIC_IRB_LOGO_ALT = "RCIC-IRB — Regulated Canadian Immigration Consultant";

export function RcicIrbLogo({
  className,
  sizes = "240px",
  eager = false,
}: {
  /** Set the rendered height here (e.g. "h-10"); width follows the logo's aspect ratio. */
  className?: string;
  sizes?: string;
  /** Load immediately — for above-the-fold placements such as the header. */
  eager?: boolean;
}) {
  return (
    <Image
      src={RCIC_IRB_LOGO_SRC}
      alt={RCIC_IRB_LOGO_ALT}
      width={1820}
      height={588}
      sizes={sizes}
      loading={eager ? "eager" : undefined}
      className={cn("w-auto object-contain", className)}
    />
  );
}
