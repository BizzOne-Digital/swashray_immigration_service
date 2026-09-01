import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  heading,
  intro,
  align = "left",
  className,
}: {
  eyebrow?: string;
  heading: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[var(--color-primary)] tracking-tight">
        {heading}
      </h2>
      {intro && <p className="mt-4 text-[var(--color-muted)] leading-relaxed">{intro}</p>}
    </div>
  );
}
