"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { inputClass, labelClass, btnPrimary, btnSecondary, sectionTitleClass, cardClass } from "@/lib/adminUi";
import { ImagePicker } from "@/components/admin/ImagePicker";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function SettingsSection() {
  const [values, setValues] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setValues(d.settings));
  }, []);

  function set(key: string, value: unknown) {
    setValues((v: any) => ({ ...v, [key]: value }));
  }
  function setSocial(key: string, value: string) {
    setValues((v: any) => ({ ...v, social: { ...v.social, [key]: value } }));
  }

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save settings.");
      toast.success("Site settings saved.");
      setValues(data.settings);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!values) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Business Information</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Business Name</label>
            <input className={inputClass} value={values.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Contact Person</label>
            <input className={inputClass} value={values.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={values.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address (optional)</label>
            <input className={inputClass} value={values.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Business Description</label>
            <textarea rows={3} className={inputClass} value={values.businessDescription} onChange={(e) => set("businessDescription", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Branding</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <ImagePicker label="Logo" value={values.logoMediaId} onChange={(id) => set("logoMediaId", id)} aspect="aspect-square" />
          <ImagePicker label="Favicon" value={values.faviconMediaId} onChange={(id) => set("faviconMediaId", id)} aspect="aspect-square" />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Social Media</h2>
        <p className="text-xs text-slate-400">Leave a field blank to hide that icon from the website footer.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {(["facebook", "instagram", "linkedin", "x", "youtube"] as const).map((key) => (
            <div key={key}>
              <label className={labelClass}>{key === "x" ? "X (Twitter)" : key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input className={inputClass} placeholder="https://" value={values.social[key]} onChange={(e) => setSocial(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Footer</h2>
        <div>
          <label className={labelClass}>Footer Description</label>
          <textarea rows={2} className={inputClass} value={values.footerDescription} onChange={(e) => set("footerDescription", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Copyright Text</label>
          <input className={inputClass} value={values.copyrightText} onChange={(e) => set("copyrightText", e.target.value)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Legal Disclaimer</h2>
        <p className="text-xs text-slate-400">Shown on service pages and the disclaimer page. Keep this general — do not state guarantees.</p>
        <textarea rows={4} className={inputClass} value={values.disclaimerText} onChange={(e) => set("disclaimerText", e.target.value)} />
      </div>

      <button onClick={onSave} disabled={saving} className={btnPrimary}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Site Settings
      </button>
    </div>
  );
}

function BookingSettingsSection() {
  const [values, setValues] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [newClosedDate, setNewClosedDate] = useState("");

  useEffect(() => {
    fetch("/api/admin/booking-settings").then((r) => r.json()).then((d) => setValues(d.settings));
  }, []);

  function toggleDay(day: number) {
    setValues((v: any) => ({
      ...v,
      workingDays: v.workingDays.includes(day) ? v.workingDays.filter((d: number) => d !== day) : [...v.workingDays, day].sort(),
    }));
  }

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/booking-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save booking settings.");
      toast.success("Booking availability saved.");
      setValues(data.settings);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save booking settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!values) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className={`${cardClass} p-6 space-y-5`}>
      <h2 className={sectionTitleClass}>Booking Availability</h2>
      <div>
        <label className={labelClass}>Working Days</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                values.workingDays.includes(i) ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-4 gap-5">
        <div>
          <label className={labelClass}>Opens At</label>
          <input type="time" className={inputClass} value={values.openTime} onChange={(e) => setValues((v: any) => ({ ...v, openTime: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Closes At</label>
          <input type="time" className={inputClass} value={values.closeTime} onChange={(e) => setValues((v: any) => ({ ...v, closeTime: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Appointment Length (min)</label>
          <input type="number" className={inputClass} value={values.appointmentDurationMinutes} onChange={(e) => setValues((v: any) => ({ ...v, appointmentDurationMinutes: Number(e.target.value) }))} />
        </div>
        <div>
          <label className={labelClass}>Buffer Between (min)</label>
          <input type="number" className={inputClass} value={values.bufferMinutes} onChange={(e) => setValues((v: any) => ({ ...v, bufferMinutes: Number(e.target.value) }))} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Closed Dates (holidays, days off)</label>
        <div className="flex gap-2 mb-2">
          <input type="date" className={inputClass} value={newClosedDate} onChange={(e) => setNewClosedDate(e.target.value)} />
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              if (newClosedDate && !values.closedDates.includes(newClosedDate)) {
                setValues((v: any) => ({ ...v, closedDates: [...v.closedDates, newClosedDate].sort() }));
                setNewClosedDate("");
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {values.closedDates.map((d: string) => (
            <span key={d} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 text-xs px-3 py-1.5">
              {d}
              <button type="button" onClick={() => setValues((v: any) => ({ ...v, closedDates: v.closedDates.filter((x: string) => x !== d) }))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
      <button onClick={onSave} disabled={saving} className={btnPrimary}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Booking Availability
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Site Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage business information, branding, and booking availability.</p>
      </div>
      <SettingsSection />
      <BookingSettingsSection />
    </div>
  );
}
