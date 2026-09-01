"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Trash2, Loader2 } from "lucide-react";
import { cardClass, inputClass, btnGhost } from "@/lib/adminUi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BOOKING_STATUSES } from "@/lib/constants";

interface BookingRow {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  preferredContactMethod: string;
  message: string;
  status: string;
  adminNotes: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (dateFilter) params.set("date", dateFilter);
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/bookings?${params.toString()}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }, [statusFilter, dateFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function saveBooking(id: string, patch: Partial<BookingRow>) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, ...patch } : b)));
      toast.success("Booking updated.");
    } catch {
      toast.error("Could not update booking.");
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this booking permanently?")) return;
    const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b._id !== id));
      toast.success("Booking deleted.");
    } else {
      toast.error("Could not delete booking.");
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Bookings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage consultation booking requests.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Search name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} max-w-xs`} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} max-w-[200px]`}>
          <option value="">All Statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={`${inputClass} max-w-[180px]`} />
      </div>

      <div className={cardClass}>
        {loading ? (
          <p className="p-8 text-sm text-slate-400">Loading bookings…</p>
        ) : bookings.length === 0 ? (
          <p className="p-8 text-sm text-slate-400">No bookings found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <div key={b._id}>
                <button
                  onClick={() => setExpanded(expanded === b._id ? null : b._id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{b.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {b.preferredDate} at {b.preferredTime} {b.serviceName && `· ${b.serviceName}`}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                  {expanded === b._id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>

                {expanded === b._id && (
                  <div className="px-5 pb-5 space-y-4 bg-slate-50/50">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <p><span className="text-slate-400">Email:</span> <a className="text-slate-800" href={`mailto:${b.email}`}>{b.email}</a></p>
                      <p><span className="text-slate-400">Phone:</span> <a className="text-slate-800" href={`tel:${b.phone}`}>{b.phone}</a></p>
                      <p><span className="text-slate-400">Preferred Contact:</span> {b.preferredContactMethod}</p>
                      <p><span className="text-slate-400">Requested:</span> {new Date(b.createdAt).toLocaleString()}</p>
                    </div>
                    {b.message && (
                      <div className="text-sm">
                        <p className="text-slate-400 mb-1">Message</p>
                        <p className="text-slate-700 whitespace-pre-line">{b.message}</p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Status</label>
                        <select
                          className={inputClass}
                          value={b.status}
                          onChange={(e) => saveBooking(b._id, { status: e.target.value })}
                        >
                          {BOOKING_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Date</label>
                        <input
                          type="date"
                          className={inputClass}
                          defaultValue={b.preferredDate}
                          onBlur={(e) => e.target.value !== b.preferredDate && saveBooking(b._id, { preferredDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Time</label>
                        <input
                          type="time"
                          className={inputClass}
                          defaultValue={b.preferredTime}
                          onBlur={(e) => e.target.value !== b.preferredTime && saveBooking(b._id, { preferredTime: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Internal Notes</label>
                      <textarea
                        rows={2}
                        className={inputClass}
                        defaultValue={b.adminNotes}
                        onBlur={(e) => e.target.value !== b.adminNotes && saveBooking(b._id, { adminNotes: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {saving === b._id && <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span>}
                      <button onClick={() => handleDelete(b._id)} className={`${btnGhost} !text-red-600 hover:!bg-red-50 ml-auto`}>
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
