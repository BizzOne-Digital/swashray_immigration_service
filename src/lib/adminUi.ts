export const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors";
export const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
export const errorClass = "text-xs text-red-600 mt-1";
export const cardClass = "rounded-xl border border-slate-200 bg-white shadow-sm";
export const sectionTitleClass = "text-sm font-semibold text-slate-900 uppercase tracking-wide";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2.5 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:pointer-events-none";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium px-4 py-2.5 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:pointer-events-none";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium px-4 py-2.5 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:pointer-events-none";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg text-slate-500 text-sm font-medium px-3 py-2 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-50";

export const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-emerald-100 text-emerald-700",
  "Reschedule Requested": "bg-sky-100 text-sky-700",
  Completed: "bg-slate-200 text-slate-700",
  Cancelled: "bg-rose-100 text-rose-700",
  Declined: "bg-rose-100 text-rose-700",
  New: "bg-sky-100 text-sky-700",
  Contacted: "bg-amber-100 text-amber-700",
  "In Progress": "bg-violet-100 text-violet-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Archived: "bg-slate-200 text-slate-600",
  draft: "bg-slate-200 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
};
