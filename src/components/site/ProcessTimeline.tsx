import { MessageCircle, UserCheck, FileCheck, ClipboardList, Award, Milestone, type LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { cn } from "@/lib/cn";

// Icons cycle by step index so the timeline reads as a coherent sequence
// regardless of how many steps the admin configures.
const STEP_ICONS: LucideIcon[] = [MessageCircle, UserCheck, FileCheck, ClipboardList, Award, Milestone];

export function ProcessTimeline({ steps }: { steps: { title: string; text: string }[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="relative mt-16 max-w-4xl mx-auto">
      {/* connecting line: left-aligned on mobile, centered on desktop */}
      <div
        className="absolute left-6 sm:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-[var(--color-primary)]/25 via-[var(--color-primary)]/15 to-transparent sm:-translate-x-1/2"
        aria-hidden="true"
      />
      <div className="space-y-10 sm:space-y-14">
        {steps.map((step, i) => {
          const StepIcon = STEP_ICONS[i % STEP_ICONS.length];
          const alignRight = i % 2 === 1;
          return (
            <ScrollReveal key={step.title} delay={Math.min(i, 6) * 80} className="relative pl-16 sm:pl-0">
              {/* icon marker, sits on the line */}
              <span
                className="absolute left-6 sm:left-1/2 top-0 -translate-x-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-background)] z-10 shadow-sm"
                aria-hidden="true"
              >
                <StepIcon className="h-4.5 w-4.5" strokeWidth={1.8} />
              </span>

              <div className={cn("sm:w-[calc(50%-2.5rem)]", alignRight ? "sm:ml-auto" : "sm:mr-auto")}>
                <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-black/[0.06] p-6 shadow-brand-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1.5 font-heading text-lg font-semibold text-[var(--color-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">{step.text}</p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
