"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Info } from "lucide-react";
import { inputClass, btnPrimary, btnGhost, cardClass } from "@/lib/adminUi";

interface NavItem {
  _id?: string;
  label: string;
  url: string;
  order: number;
  visible: boolean;
  openInNewTab: boolean;
}

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/navigation")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      });
  }, []);

  function update(i: number, patch: Partial<NavItem>) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }

  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = i + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setItems(data.items);
      toast.success("Navigation updated.");
    } catch {
      toast.error("Could not save navigation.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Navigation</h1>
        <p className="text-sm text-slate-500 mt-1">Control the labels, links, order, and visibility of the main menu.</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          The menu item linking to <strong>/services</strong> automatically becomes the <strong>Programs</strong> dropdown,
          listing every published service (managed on the Services page). You can rename its label, but keep the link as{" "}
          <strong>/services</strong> so the dropdown keeps working.
        </p>
      </div>

      <div className={`${cardClass} p-6 space-y-4`}>
        {items.map((item, i) => (
          <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <div className="grid grid-cols-12 gap-3 items-center">
              <input
                className={`${inputClass} col-span-4`}
                placeholder="Label"
                value={item.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <input
                className={`${inputClass} col-span-4`}
                placeholder="/url"
                value={item.url}
                onChange={(e) => update(i, { url: e.target.value })}
              />
              <label className="col-span-2 flex items-center gap-1.5 text-xs text-slate-600">
                <input type="checkbox" checked={item.visible} onChange={(e) => update(i, { visible: e.target.checked })} />
                Visible
              </label>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <button type="button" className={`${btnGhost} !px-2 !py-1`} onClick={() => move(i, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" className={`${btnGhost} !px-2 !py-1`} onClick={() => move(i, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`${btnGhost} !px-2 !py-1 hover:!bg-red-50 hover:!text-red-600`}
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {item.url.trim() === "/services" && (
              <p className="mt-2 text-xs font-medium text-sky-700">
                → Powers the Programs dropdown, auto-populated from Services
              </p>
            )}
          </div>
        ))}

        <button
          type="button"
          className={btnGhost}
          onClick={() => setItems((prev) => [...prev, { label: "", url: "/", order: prev.length, visible: true, openInNewTab: false }])}
        >
          <Plus className="h-4 w-4" /> Add Menu Item
        </button>
      </div>

      <button onClick={onSave} disabled={saving} className={btnPrimary}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Navigation
      </button>
    </div>
  );
}
