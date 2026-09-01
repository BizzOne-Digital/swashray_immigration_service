import { Info } from "lucide-react";

export function DisclaimerNote({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex gap-3 rounded-[var(--radius-card)] bg-[var(--color-muted)]/10 border border-black/[0.06] p-5">
      <Info className="h-4.5 w-4.5 text-[var(--color-muted)] shrink-0 mt-0.5" />
      <p className="text-xs text-[var(--color-muted)] leading-relaxed">{text}</p>
    </div>
  );
}
