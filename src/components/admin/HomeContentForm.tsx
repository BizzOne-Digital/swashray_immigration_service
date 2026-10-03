"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { inputClass, labelClass, btnPrimary, btnGhost, sectionTitleClass, cardClass } from "@/lib/adminUi";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { VideoPicker } from "@/components/admin/VideoPicker";
import { ICON_NAMES, Icon } from "@/components/ui/IconMap";

export function HomeContentForm() {
  const [values, setValues] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/home").then((r) => r.json()).then((d) => setValues(d.content));
  }, []);

  function set(key: string, value: unknown) {
    setValues((v: any) => ({ ...v, [key]: value }));
  }

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      toast.success("Homepage content saved.");
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
        <h2 className={sectionTitleClass}>Hero Section (SEO fallback)</h2>
        <p className="text-xs text-slate-500 -mt-2">
          Used for the page title/meta description and as a fallback — the homepage itself now displays the Hero Slider below. Keep the headline exact, it is the site&apos;s required page title.
        </p>
        <div>
          <label className={labelClass}>Headline</label>
          <input className={inputClass} value={values.heroHeadline} onChange={(e) => set("heroHeadline", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Subheading</label>
          <textarea rows={3} className={inputClass} value={values.heroSubheading} onChange={(e) => set("heroSubheading", e.target.value)} />
        </div>
        <ImagePicker label="Hero Image (meta/share preview)" value={values.heroImageMediaId} onChange={(id) => set("heroImageMediaId", id)} />
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Primary Button Text</label>
            <input className={inputClass} value={values.primaryCtaText} onChange={(e) => set("primaryCtaText", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Primary Button Link</label>
            <input className={inputClass} value={values.primaryCtaUrl} onChange={(e) => set("primaryCtaUrl", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Secondary Button Text</label>
            <input className={inputClass} value={values.secondaryCtaText} onChange={(e) => set("secondaryCtaText", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Secondary Button Link</label>
            <input className={inputClass} value={values.secondaryCtaUrl} onChange={(e) => set("secondaryCtaUrl", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={sectionTitleClass}>Homepage Hero Slider</h2>
            <p className="text-xs text-slate-500 mt-1">
              The cinematic slider at the top of the homepage. Video-only background — each slide needs its own video, heading and button; a slide with no video shows a plain brand-colored panel instead (never a static photo). The &quot;Explore Our Services&quot; link above is shown on every slide as the secondary action.
            </p>
          </div>
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              set("heroSlides", [
                ...values.heroSlides,
                { label: "", heading: "", subheading: "", videoMediaId: null, ctaText: "Learn More", ctaUrl: "/services" },
              ])
            }
            disabled={values.heroSlides.length >= 8}
          >
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        </div>
        {values.heroSlides.length === 0 && (
          <p className="text-sm text-slate-400">No slides yet — add one above to turn on the hero slider.</p>
        )}
        {values.heroSlides.map((slide: any, i: number) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Slide {i + 1}</p>
              <button
                type="button"
                onClick={() => set("heroSlides", values.heroSlides.filter((_: any, idx: number) => idx !== i))}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <VideoPicker
              label="Background Video"
              value={slide.videoMediaId}
              onChange={(id) => {
                const next = [...values.heroSlides];
                next[i] = { ...next[i], videoMediaId: id };
                set("heroSlides", next);
              }}
            />
            <div>
              <label className={labelClass}>Label (small eyebrow text)</label>
              <input
                className={inputClass}
                placeholder="e.g. Family Sponsorship"
                value={slide.label}
                onChange={(e) => {
                  const next = [...values.heroSlides];
                  next[i] = { ...next[i], label: e.target.value };
                  set("heroSlides", next);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                className={inputClass}
                value={slide.heading}
                onChange={(e) => {
                  const next = [...values.heroSlides];
                  next[i] = { ...next[i], heading: e.target.value };
                  set("heroSlides", next);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Subheading (typewriter text)</label>
              <textarea
                rows={2}
                className={inputClass}
                value={slide.subheading}
                onChange={(e) => {
                  const next = [...values.heroSlides];
                  next[i] = { ...next[i], subheading: e.target.value };
                  set("heroSlides", next);
                }}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Button Text</label>
                <input
                  className={inputClass}
                  value={slide.ctaText}
                  onChange={(e) => {
                    const next = [...values.heroSlides];
                    next[i] = { ...next[i], ctaText: e.target.value };
                    set("heroSlides", next);
                  }}
                />
              </div>
              <div>
                <label className={labelClass}>Button Link</label>
                <input
                  className={inputClass}
                  value={slide.ctaUrl}
                  onChange={(e) => {
                    const next = [...values.heroSlides];
                    next[i] = { ...next[i], ctaUrl: e.target.value };
                    set("heroSlides", next);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Calculator Teaser Section</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.calculatorHeading} onChange={(e) => set("calculatorHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Intro Text</label>
          <textarea rows={2} className={inputClass} value={values.calculatorIntro} onChange={(e) => set("calculatorIntro", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Button Text</label>
          <input className={inputClass} value={values.calculatorCtaText} onChange={(e) => set("calculatorCtaText", e.target.value)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>Booking Section</h2>
          <button type="button" className={btnGhost} onClick={() => set("bookingHighlights", [...values.bookingHighlights, ""])}>
            <Plus className="h-4 w-4" /> Add Highlight
          </button>
        </div>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.bookingHeading} onChange={(e) => set("bookingHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Intro Text</label>
          <textarea rows={2} className={inputClass} value={values.bookingIntro} onChange={(e) => set("bookingIntro", e.target.value)} />
        </div>
        {values.bookingHighlights.map((h: string, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputClass}
              value={h}
              onChange={(e) => {
                const next = [...values.bookingHighlights];
                next[i] = e.target.value;
                set("bookingHighlights", next);
              }}
            />
            <button
              type="button"
              onClick={() => set("bookingHighlights", values.bookingHighlights.filter((_: string, idx: number) => idx !== i))}
              className="text-slate-400 hover:text-red-600 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div>
          <label className={labelClass}>Button Text</label>
          <input className={inputClass} value={values.bookingCtaText} onChange={(e) => set("bookingCtaText", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Trust Panel Heading</label>
          <input className={inputClass} value={values.trustHeading} onChange={(e) => set("trustHeading", e.target.value)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Services Section</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.servicesHeading} onChange={(e) => set("servicesHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Intro Text</label>
          <textarea rows={2} className={inputClass} value={values.servicesIntro} onChange={(e) => set("servicesIntro", e.target.value)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>Why Choose Us — Benefits</h2>
          <button type="button" className={btnGhost} onClick={() => set("benefits", [...values.benefits, { title: "", text: "", icon: "ShieldCheck" }])}>
            <Plus className="h-4 w-4" /> Add Benefit
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Section Heading</label>
            <input className={inputClass} value={values.whyChooseHeading} onChange={(e) => set("whyChooseHeading", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Section Intro</label>
            <input className={inputClass} value={values.whyChooseIntro} onChange={(e) => set("whyChooseIntro", e.target.value)} />
          </div>
        </div>
        {values.benefits.map((b: any, i: number) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name={b.icon} className="h-4 w-4 text-slate-500" />
                <select
                  className={`${inputClass} !w-auto !py-1.5 text-xs`}
                  value={b.icon}
                  onChange={(e) => {
                    const next = [...values.benefits];
                    next[i] = { ...next[i], icon: e.target.value };
                    set("benefits", next);
                  }}
                >
                  {ICON_NAMES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => set("benefits", values.benefits.filter((_: any, idx: number) => idx !== i))} className="text-slate-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="Title"
              value={b.title}
              onChange={(e) => {
                const next = [...values.benefits];
                next[i] = { ...next[i], title: e.target.value };
                set("benefits", next);
              }}
            />
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Description"
              value={b.text}
              onChange={(e) => {
                const next = [...values.benefits];
                next[i] = { ...next[i], text: e.target.value };
                set("benefits", next);
              }}
            />
          </div>
        ))}
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>Immigration Journey — Steps</h2>
          <button type="button" className={btnGhost} onClick={() => set("journeySteps", [...values.journeySteps, { title: "", text: "" }])}>
            <Plus className="h-4 w-4" /> Add Step
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Section Heading</label>
            <input className={inputClass} value={values.journeyHeading} onChange={(e) => set("journeyHeading", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Section Intro</label>
            <input className={inputClass} value={values.journeyIntro} onChange={(e) => set("journeyIntro", e.target.value)} />
          </div>
        </div>
        {values.journeySteps.map((step: any, i: number) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Step {i + 1}</p>
              <button type="button" onClick={() => set("journeySteps", values.journeySteps.filter((_: any, idx: number) => idx !== i))} className="text-slate-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="Step title"
              value={step.title}
              onChange={(e) => {
                const next = [...values.journeySteps];
                next[i] = { ...next[i], title: e.target.value };
                set("journeySteps", next);
              }}
            />
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Step description"
              value={step.text}
              onChange={(e) => {
                const next = [...values.journeySteps];
                next[i] = { ...next[i], text: e.target.value };
                set("journeySteps", next);
              }}
            />
          </div>
        ))}
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>News Section</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={values.newsHeading} onChange={(e) => set("newsHeading", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Intro Text</label>
          <input className={inputClass} value={values.newsIntro} onChange={(e) => set("newsIntro", e.target.value)} />
        </div>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <h2 className={sectionTitleClass}>Bottom Call To Action</h2>
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
            <label className={labelClass}>Primary Button Text</label>
            <input className={inputClass} value={values.ctaPrimaryText} onChange={(e) => set("ctaPrimaryText", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Primary Button Link</label>
            <input className={inputClass} value={values.ctaPrimaryUrl} onChange={(e) => set("ctaPrimaryUrl", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Secondary Button Text</label>
            <input className={inputClass} value={values.ctaSecondaryText} onChange={(e) => set("ctaSecondaryText", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Secondary Button Link</label>
            <input className={inputClass} value={values.ctaSecondaryUrl} onChange={(e) => set("ctaSecondaryUrl", e.target.value)} />
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
        Save Homepage Content
      </button>
    </div>
  );
}
