import Image from "next/image";
import Link from "next/link";
import { LogoMark, LogoWordmark } from "@/components/site/LogoMark";
import { mediaUrl } from "@/lib/utils";
import type mongoose from "mongoose";

export function Logo({
  logoMediaId,
  businessName,
  href = "/",
  light = false,
  stacked = false,
}: {
  logoMediaId?: mongoose.Types.ObjectId | string | null;
  businessName: string;
  href?: string;
  light?: boolean;
  /** Icon on top, "Swashray / Immigration Services" centered underneath —
   * used in the header, where the brand mark stands on its own. Left as a
   * horizontal icon+wordmark row (the default) anywhere it sits beside other
   * left-aligned content, e.g. the footer's logo-and-description column. */
  stacked?: boolean;
}) {
  const url = mediaUrl(logoMediaId as string | null | undefined);
  return (
    <Link href={href} className={stacked ? "flex flex-col items-center shrink-0" : "flex items-center shrink-0"}>
      <span className={stacked ? "flex flex-col items-center gap-1" : "flex items-center gap-2.5"}>
        {url ? (
          // A custom icon/mark has been uploaded (Admin → Site Settings →
          // Branding) — it replaces the code-drawn shield mark below, but the
          // "Swashray / Immigration Services / Canadian Immigration
          // Consultancy" wordmark still renders alongside it either way, so
          // uploading a plain icon (no text baked in) never silently drops
          // the business name from the header/footer.
          <Image
            src={url}
            alt={businessName}
            width={64}
            height={64}
            priority
            className={stacked ? "h-10 w-10 sm:h-11 sm:w-11 object-contain" : "h-9 w-9 object-contain"}
          />
        ) : (
          <LogoMark className={stacked ? "h-9 w-9 sm:h-10 sm:w-10" : "h-9 w-9"} light={light} />
        )}
        <LogoWordmark light={light} />
      </span>
    </Link>
  );
}
