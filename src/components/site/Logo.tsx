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
    <Link href={href} className="flex items-center gap-2.5 shrink-0">
      {url ? (
        <Image src={url} alt={businessName} width={40} height={40} className="h-10 w-auto object-contain" />
      ) : (
        <LogoMark className="h-9 w-9" light={light} />
      )}
      <LogoWordmark light={light} />
    </Link>
  );
}
