"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { inputClass, labelClass, btnPrimary, btnSecondary, btnGhost, sectionTitleClass, cardClass } from "@/lib/adminUi";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { ICON_NAMES, Icon } from "@/components/ui/IconMap";

export interface ServiceFormValues {
  _id?: string;
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  whoItsFor: string;
  process: string;
  icon: string;
  ctaText: string;
  ctaUrl: string;
  order: number;
  active: boolean;
  featuredImageMediaId: string | null;
  faq: { question: string; answer: string }[];
  seo: { title: string; description: string };
}

const EMPTY: ServiceFormValues = {
  title: "",
  shortDescription: "",
  description: "",
  whoItsFor: "",
  process: "",
  icon: "FileCheck",
  ctaText: "Book a Consultation",
  ctaUrl: "/booking",
  order: 0,
  active: true,
  featuredImageMediaId: null,
  faq: [],
  seo: { title: "", description: "" },
};

export function ServiceForm({ initial }: { initial?: ServiceFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ServiceFormValues>(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  function set<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/services/${initial!._id}` : "/api/admin/services";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save service.");
      toast.success(isEdit ? "Service updated." : "Service created.");
      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Basics</h2>
        <div>
          <label className={labelClass}>Title *</label>
          <input required className={inputClass} value={values.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>URL Slug (optional — auto-generated from title if left blank)</label>
          <input className={inputClass} value={values.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="visitor-visa" />
        </div>
        <div>
          <label className={labelClass}>Short Description (used on cards)</label>
          <textarea rows={2} className={inputClass} value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Icon</label>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                <Icon name={values.icon} className="h-5 w-5 text-slate-700" />
              </span>
              <select className={inputClass} value={values.icon} onChange={(e) => set("icon", e.target.value)}>
                {ICON_NAMES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Sort Order (lower shows first)</label>
            <input type="number" className={inputClass} value={values.order} onChange={(e) => set("order", Number(e.target.value))} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input id="active" type="checkbox" checked={values.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          <label htmlFor="active" className="text-sm text-slate-700">Published (visible on the public website)</label>
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <h2 className={sectionTitleClass}>Featured Image</h2>
        <div className="mt-4">
          <ImagePicker label="" value={values.featuredImageMediaId} onChange={(id) => set("featuredImageMediaId", id)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Content</h2>
        <div>
          <label className={labelClass}>Overview</label>
          <textarea rows={5} className={inputClass} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Who This May Be For</label>
          <textarea rows={3} className={inputClass} value={values.whoItsFor} onChange={(e) => set("whoItsFor", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Our Process</label>
          <p className="text-xs text-slate-500 mb-1.5">
            Enter one step per line (e.g. &ldquo;We review your documents&rdquo; on its own line, then the next
            step on the next line) — the site displays each line as a numbered step. A single line of text
            still displays fine as a plain paragraph.
          </p>
          <textarea rows={5} className={inputClass} value={values.process} onChange={(e) => set("process", e.target.value)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>FAQ</h2>
          <button
            type="button"
            className={btnGhost}
            onClick={() => set("faq", [...values.faq, { question: "", answer: "" }])}
          >
            <Plus className="h-4 w-4" /> Add Question
          </button>
        </div>
        {values.faq.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Question {i + 1}</p>
              <button
                type="button"
                onClick={() => set("faq", values.faq.filter((_, idx) => idx !== i))}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="Question"
              value={item.question}
              onChange={(e) => {
                const next = [...values.faq];
                next[i] = { ...next[i], question: e.target.value };
                set("faq", next);
              }}
            />
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Answer"
              value={item.answer}
              onChange={(e) => {
                const next = [...values.faq];
                next[i] = { ...next[i], answer: e.target.value };
                set("faq", next);
              }}
            />
          </div>
        ))}
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Call To Action</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Button Text</label>
            <input className={inputClass} value={values.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Button Link</label>
            <input className={inputClass} value={values.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>SEO</h2>
        <div>
          <label className={labelClass}>SEO Title (optional)</label>
          <input className={inputClass} value={values.seo.title} onChange={(e) => set("seo", { ...values.seo, title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Meta Description (optional)</label>
          <textarea rows={2} className={inputClass} value={values.seo.description} onChange={(e) => set("seo", { ...values.seo, description: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Service"}
        </button>
        <button type="button" className={btnSecondary} onClick={() => router.push("/admin/services")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
