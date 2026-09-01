import { STATUS_COLORS } from "@/lib/adminUi";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_COLORS[status] || "bg-slate-100 text-slate-600"
      )}
    >
      {status}
    </span>
  );
}
