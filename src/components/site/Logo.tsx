import Image from "next/image";
import Link from "next/link";

export function Logo({
  businessName,
  href = "/",
}: {
  businessName: string;
  href?: string;
}) {
  return (
    <Link href={href} className="flex items-center shrink-0">
      <Image
        src="/logo.png"
        alt={businessName}
        width={507}
        height={560}
        priority
        className="h-24 md:h-28 w-auto object-contain"
      />
    </Link>
  );
}
