"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { inputClass, labelClass, btnPrimary, sectionTitleClass, cardClass } from "@/lib/adminUi";

const COLOR_FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "primary", label: "Primary (deep blue)", hint: "Main brand color — nav, links, primary buttons" },
  { key: "secondary", label: "Secondary (navy)", hint: "Darker blue — gradients, hover states" },
  { key: "accent", label: "Accent (gold)", hint: "Premium accent — use sparingly: dividers, icons, badges" },
  { key: "highlight", label: "Highlight (red)", hint: "Strategic accent — CTA emphasis, small indicators, hover" },
  { key: "dark", label: "Dark (near-black)", hint: "Footer and premium section backgrounds" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface (cards)" },
  { key: "text", label: "Body Text" },
  { key: "muted", label: "Muted Text" },
];

export default function AdminThemePage() {
  const [values, setValues] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/theme").then((r) => r.json()).then((d) => setValues(d.theme));
  }, []);

  function setColor(key: string, value: string) {
    setValues((v: any) => ({ ...v, colors: { ...v.colors, [key]: value } }));
  }

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save theme.");
      toast.success("Theme updated. Changes are live on the public website.");
      setValues(data.theme);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save theme.");
    } finally {
      setSaving(false);
    }
  }

  if (!values) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Theme</h1>
        <p className="text-sm text-slate-500 mt-1">Control the colors, button style, and typography of the public website.</p>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Colors</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {COLOR_FIELDS.map((f) => (
            <div key={f.key}>
              <label className={labelClass}>{f.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={values.colors[f.key]}
                  onChange={(e) => setColor(f.key, e.target.value)}
                  className="h-10 w-12 rounded border border-slate-200 cursor-pointer shrink-0"
                />
                <input className={inputClass} value={values.colors[f.key]} onChange={(e) => setColor(f.key, e.target.value)} />
              </div>
              {f.hint && <p className="mt-1 text-xs text-slate-400">{f.hint}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Style</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Border Radius</label>
            <select className={inputClass} value={values.borderRadius} onChange={(e) => setValues((v: any) => ({ ...v, borderRadius: e.target.value }))}>
              <option value="none">None (sharp)</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Button Style</label>
            <select className={inputClass} value={values.buttonStyle} onChange={(e) => setValues((v: any) => ({ ...v, buttonStyle: e.target.value }))}>
              <option value="solid">Solid</option>
              <option value="outline">Outline</option>
              <option value="pill">Pill (fully rounded)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Heading Font</label>
            <select className={inputClass} value={values.headingFont} onChange={(e) => setValues((v: any) => ({ ...v, headingFont: e.target.value }))}>
              <option value="serif">Serif (elegant)</option>
              <option value="sans">Sans-serif (modern)</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={onSave} disabled={saving} className={btnPrimary}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Theme
      </button>
    </div>
  );
}
