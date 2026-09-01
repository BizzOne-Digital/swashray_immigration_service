"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { inputClass, labelClass, btnPrimary, btnSecondary, sectionTitleClass, cardClass } from "@/lib/adminUi";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { NEWS_CATEGORIES } from "@/lib/constants";

export interface NewsFormValues {
  _id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  status: "draft" | "published";
  featured: boolean;
  isDemo: boolean;
  featuredImageMediaId: string | null;
  seo: { title: string; description: string };
}

const EMPTY: NewsFormValues = {
  title: "",
  excerpt: "",
  content: "",
  category: "General Updates",
  tags: [],
  author: "Swashray Immigration Team",
  status: "draft",
  featured: false,
  isDemo: false,
  featuredImageMediaId: null,
  seo: { title: "", description: "" },
};

export function NewsForm({ initial }: { initial?: NewsFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<NewsFormValues>(initial || EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  function set<K extends keyof NewsFormValues>(key: K, value: NewsFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !values.tags.includes(t)) set("tags", [...values.tags, t]);
    setTagInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/news/${initial!._id}` : "/api/admin/news";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save article.");
      toast.success(isEdit ? "Article updated." : "Article created.");
      router.push("/admin/news");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save article.");
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
          <input className={inputClass} value={values.slug || ""} onChange={(e) => set("slug", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Excerpt (shown on cards)</label>
          <textarea rows={2} className={inputClass} value={values.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={values.category} onChange={(e) => set("category", e.target.value)}>
              {NEWS_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Author</label>
            <input className={inputClass} value={values.author} onChange={(e) => set("author", e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              className={inputClass}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type a tag and press Enter"
            />
            <button type="button" className={btnSecondary} onClick={addTag}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {values.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 text-xs px-3 py-1.5">
                {t}
                <button type="button" onClick={() => set("tags", values.tags.filter((x) => x !== t))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <h2 className={sectionTitleClass}>Featured Image</h2>
        <div className="mt-4">
          <ImagePicker label="" value={values.featuredImageMediaId} onChange={(id) => set("featuredImageMediaId", id)} />
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <h2 className={sectionTitleClass}>Article Content</h2>
        <textarea
          rows={14}
          className={`${inputClass} mt-4`}
          value={values.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="Write the full article here. Paragraph breaks are preserved."
        />
      </div>

      <div className={`${cardClass} p-6 space-y-4`}>
        <h2 className={sectionTitleClass}>Publishing</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={values.status} onChange={(e) => set("status", e.target.value as "draft" | "published")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input id="featured" type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          <label htmlFor="featured" className="text-sm text-slate-700">Featured (shown first on the homepage/news page)</label>
        </div>
        <div className="flex items-center gap-2">
          <input id="isDemo" type="checkbox" checked={values.isDemo} onChange={(e) => set("isDemo", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          <label htmlFor="isDemo" className="text-sm text-slate-700">Mark as demo content (shows a &quot;Demo&quot; badge — remove once you add real news)</label>
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
          {isEdit ? "Save Changes" : "Create Article"}
        </button>
        <button type="button" className={btnSecondary} onClick={() => router.push("/admin/news")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
