"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Trash2, Loader2, Circle } from "lucide-react";
import { cardClass, inputClass, btnGhost } from "@/lib/adminUi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { INQUIRY_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface InquiryRow {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceOfInterest: string;
  message: string;
  preferredContactMethod: string;
  status: string;
  read: boolean;
  adminNotes: string;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
    const data = await res.json();
    setInquiries(data.inquiries || []);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function saveInquiry(id: string, patch: Partial<InquiryRow>, silent = false) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setInquiries((prev) => prev.map((i) => (i._id === id ? { ...i, ...patch } : i)));
      if (!silent) toast.success("Inquiry updated.");
    } catch {
      if (!silent) toast.error("Could not update inquiry.");
    } finally {
      setSaving(null);
    }
  }

  function toggleExpand(row: InquiryRow) {
    const willOpen = expanded !== row._id;
    setExpanded(willOpen ? row._id : null);
    if (willOpen && !row.read) saveInquiry(row._id, { read: true }, true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this inquiry permanently?")) return;
    const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInquiries((prev) => prev.filter((i) => i._id !== id));
      toast.success("Inquiry deleted.");
    } else {
      toast.error("Could not delete inquiry.");
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Inquiries</h1>
        <p className="text-sm text-slate-500 mt-1">Customer inquiries submitted through the contact form.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Search name, email, message…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} max-w-xs`} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} max-w-[200px]`}>
          <option value="">All Statuses</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className={cardClass}>
        {loading ? (
          <p className="p-8 text-sm text-slate-400">Loading inquiries…</p>
        ) : inquiries.length === 0 ? (
          <p className="p-8 text-sm text-slate-400">No inquiries found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {inquiries.map((i) => (
              <div key={i._id}>
                <button onClick={() => toggleExpand(i)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50">
                  <Circle className={cn("h-2 w-2 shrink-0", i.read ? "fill-transparent text-slate-200" : "fill-sky-500 text-sky-500")} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate", i.read ? "font-medium text-slate-700" : "font-semibold text-slate-900")}>{i.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{i.serviceOfInterest || "General inquiry"} · {new Date(i.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={i.status} />
                  {expanded === i._id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>

                {expanded === i._id && (
                  <div className="px-5 pb-5 space-y-4 bg-slate-50/50">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <p><span className="text-slate-400">Email:</span> <a className="text-slate-800" href={`mailto:${i.email}`}>{i.email}</a></p>
                      <p><span className="text-slate-400">Phone:</span> {i.phone ? <a className="text-slate-800" href={`tel:${i.phone}`}>{i.phone}</a> : "—"}</p>
                      <p><span className="text-slate-400">Preferred Contact:</span> {i.preferredContactMethod}</p>
                      <p><span className="text-slate-400">Submitted:</span> {new Date(i.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-400 mb-1">Message</p>
                      <p className="text-slate-700 whitespace-pre-line">{i.message}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Status</label>
                        <select className={inputClass} value={i.status} onChange={(e) => saveInquiry(i._id, { status: e.target.value })}>
                          {INQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Internal Notes</label>
                      <textarea
                        rows={2}
                        className={inputClass}
                        defaultValue={i.adminNotes}
                        onBlur={(e) => e.target.value !== i.adminNotes && saveInquiry(i._id, { adminNotes: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {saving === i._id && <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span>}
                      <button onClick={() => handleDelete(i._id)} className={`${btnGhost} !text-red-600 hover:!bg-red-50 ml-auto`}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
