"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { inputClass, labelClass, btnPrimary, sectionTitleClass, cardClass } from "@/lib/adminUi";
import { ImagePicker } from "@/components/admin/ImagePicker";

export function AboutContentForm() {
  const [values, setValues] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/about").then((r) => r.json()).then((d) => setValues(d.content));
  }, []);

  function set(key: string, value: unknown) {
    setValues((v: any) => ({ ...v, [key]: value }));
  }

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      toast.success("About page content saved.");
      setValues(data.content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (!values) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Introduction</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.introHeading} onChange={(e) => set("introHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <textarea rows={5} className={inputClass} value={values.introText} onChange={(e) => set("introText", e.target.value)} />
        </div>
        <ImagePicker label="Introduction Image" value={values.introImageMediaId} onChange={(id) => set("introImageMediaId", id)} />
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Mission</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.missionHeading} onChange={(e) => set("missionHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <textarea rows={3} className={inputClass} value={values.missionText} onChange={(e) => set("missionText", e.target.value)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Our Approach</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.approachHeading} onChange={(e) => set("approachHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <textarea rows={3} className={inputClass} value={values.approachText} onChange={(e) => set("approachText", e.target.value)} />
        </div>
        <ImagePicker label="Approach Image" value={values.approachImageMediaId} onChange={(id) => set("approachImageMediaId", id)} />
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Why Clients Choose Us</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.whyChooseHeading} onChange={(e) => set("whyChooseHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <textarea rows={3} className={inputClass} value={values.whyChooseText} onChange={(e) => set("whyChooseText", e.target.value)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Call To Action</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.ctaHeading} onChange={(e) => set("ctaHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <textarea rows={2} className={inputClass} value={values.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Button Text</label>
            <input className={inputClass} value={values.ctaButtonText} onChange={(e) => set("ctaButtonText", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Button Link</label>
            <input className={inputClass} value={values.ctaButtonUrl} onChange={(e) => set("ctaButtonUrl", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>SEO</h2>
        <div>
          <label className={labelClass}>SEO Title</label>
          <input className={inputClass} value={values.seo.title} onChange={(e) => set("seo", { ...values.seo, title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Meta Description</label>
          <textarea rows={2} className={inputClass} value={values.seo.description} onChange={(e) => set("seo", { ...values.seo, description: e.target.value })} />
        </div>
      </div>

      <button onClick={onSave} disabled={saving} className={btnPrimary}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save About Page Content
      </button>
    </div>
  );
}
