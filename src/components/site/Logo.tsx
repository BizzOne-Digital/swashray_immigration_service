import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/utils";
import type mongoose from "mongoose";

export const SWASHRAY_LOGO_SRC = "/images/branding/swashray-logo.jpg";

export function Logo({
  logoMediaId,
  businessName,
  href = "/",
  light = false,
  stacked = false,
  eager = false,
  compact = false,
}: {
  logoMediaId?: mongoose.Types.ObjectId | string | null;
  businessName: string;
  href?: string;
  light?: boolean;
  stacked?: boolean;
  /** Load immediately — for above-the-fold placements such as the header. */
  eager?: boolean;
  compact?: boolean;
}) {
  const src = mediaUrl(logoMediaId as string | null | undefined) || SWASHRAY_LOGO_SRC;
  if (compact) {
    return (
      <Link href={href} aria-label={`${businessName}, home`} className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span aria-hidden="true" className="relative h-8 w-9 shrink-0 overflow-hidden sm:h-[62px] sm:w-[70px]">
          <Image
            src={src}
            alt=""
            width={1195}
            height={896}
            sizes="(min-width: 640px) 188px, 96px"
            loading={eager ? "eager" : undefined}
            className="absolute -left-8 -top-[7px] h-auto w-24 max-w-none sm:-left-[62px] sm:-top-[15px] sm:w-[188px]"
          />
        </span>
        <span className="block max-w-[161px] sm:max-w-none">
          <span className="block font-heading text-[26px] font-semibold leading-none tracking-tight text-[#0a3449] sm:text-[32px]">
            Swashray
          </span>
          <span className="mt-1 block whitespace-nowrap text-xs font-semibold uppercase leading-tight text-[#0a3449] sm:text-sm sm:tracking-[0.06em]">
            Immigration Services
          </span>
          <span className="mt-1 block text-xs font-medium leading-tight text-[var(--color-muted)]">
            Canadian Immigration Consultancy
          </span>
        </span>
      </Link>
    );
  }
  return (
    <Link href={href} className={stacked ? "flex flex-col items-center shrink-0" : "flex items-center shrink-0"}>
      <Image
        src={src}
        alt={businessName}
        width={1195}
        height={896}
        sizes={light ? "208px" : "(min-width: 640px) 176px, 144px"}
        loading={eager ? "eager" : undefined}
        className={light ? "h-auto w-52 rounded-md bg-white object-contain" : "h-auto w-36 sm:w-44 object-contain"}
      />
    </Link>
  );
}
