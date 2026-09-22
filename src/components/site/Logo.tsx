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
}: {
  logoMediaId?: mongoose.Types.ObjectId | string | null;
  businessName: string;
  href?: string;
  light?: boolean;
}) {
  const url = mediaUrl(logoMediaId as string | null | undefined);
  return (
    <Link href={href} className="flex items-center shrink-0">
      {url ? (
        // A custom logo has been uploaded (Admin → Site Settings → Branding) —
        // it's shown on its own, full brand mark, rather than alongside the
        // generic wordmark below (which is only a placeholder for when no
        // logo has been uploaded yet).
        <Image
          src={url}
          alt={businessName}
          width={180}
          height={48}
          priority
          className="h-10 md:h-11 w-auto object-contain"
        />
      ) : (
        <span className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" light={light} />
          <LogoWordmark light={light} />
        </span>
      )}
    </Link>
  );
}
