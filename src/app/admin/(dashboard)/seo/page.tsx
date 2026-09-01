"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { inputClass, labelClass, btnPrimary, sectionTitleClass, cardClass } from "@/lib/adminUi";
import { ImagePicker } from "@/components/admin/ImagePicker";

export default function AdminSeoPage() {
  const [values, setValues] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setValues(d.settings));
  }, []);

  function setSeo(key: string, value: unknown) {
    setValues((v: any) => ({ ...v, seoDefaults: { ...v.seoDefaults, [key]: value } }));
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
      if (!res.ok) throw new Error(data.error || "Could not save SEO settings.");
      toast.success("SEO defaults saved.");
      setValues(data.settings);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save SEO settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!values) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">SEO</h1>
        <p className="text-sm text-slate-500 mt-1">
          Sitewide defaults used when a page doesn&apos;t have its own SEO title/description. Individual services and news
          articles have their own SEO fields on their edit screens.
        </p>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Default Metadata</h2>
        <div>
          <label className={labelClass}>Site Title</label>
          <input className={inputClass} value={values.seoDefaults.title} onChange={(e) => setSeo("title", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Meta Description</label>
          <textarea rows={3} className={inputClass} value={values.seoDefaults.description} onChange={(e) => setSeo("description", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Keywords (comma-separated)</label>
          <input className={inputClass} value={values.seoDefaults.keywords} onChange={(e) => setSeo("keywords", e.target.value)} />
        </div>
        <ImagePicker
          label="Default Social Sharing Image (Open Graph)"
          value={values.seoDefaults.ogImageMediaId}
          onChange={(id) => setSeo("ogImageMediaId", id)}
        />
      </div>

      <button onClick={onSave} disabled={saving} className={btnPrimary}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save SEO Settings
      </button>
    </div>
  );
}
