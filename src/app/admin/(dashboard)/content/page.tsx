"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { HomeContentForm } from "@/components/admin/HomeContentForm";
import { AboutContentForm } from "@/components/admin/AboutContentForm";

const TABS = [
  { key: "home", label: "Homepage" },
  { key: "about", label: "About Page" },
] as const;

export default function AdminContentPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("home");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Website Content</h1>
        <p className="text-sm text-slate-500 mt-1">Edit the text and images shown on your homepage and about page.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "home" ? <HomeContentForm /> : <AboutContentForm />}
    </div>
  );
}
