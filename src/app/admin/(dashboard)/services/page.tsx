"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Copy, Trash2, ExternalLink, GripVertical, Info } from "lucide-react";
import { cardClass, btnPrimary, btnGhost } from "@/lib/adminUi";
import { Icon } from "@/components/ui/IconMap";
import { cn } from "@/lib/cn";

interface ServiceRow {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  order: number;
  active: boolean;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (index !== overIndex) setOverIndex(index);
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setOverIndex(null);
  }

  async function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (from === null || from === index) return;

    const reordered = [...services];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(index, 0, moved);
    setServices(reordered);

    setSavingOrder(true);
    try {
      const res = await fetch("/api/admin/services/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered.map((s) => s._id) }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order updated — this now controls the Programs menu too.");
    } catch {
      toast.error("Could not save the new order. Reverting.");
      load();
    } finally {
      setSavingOrder(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success("Service deleted.");
    } else {
      toast.error("Could not delete service.");
    }
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/admin/services/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      toast.success("Service duplicated.");
      load();
    } else {
      toast.error("Could not duplicate service.");
    }
  }

  async function toggleActive(row: ServiceRow) {
    const res = await fetch(`/api/admin/services/${row._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, active: !row.active }),
    });
    if (res.ok) {
      setServices((prev) => prev.map((s) => (s._id === row._id ? { ...s, active: !s.active } : s)));
    } else {
      toast.error("Could not update service. Open it to edit full details.");
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">Services</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the immigration service categories shown on the website.</p>
        </div>
        <Link href="/admin/services/new" className={btnPrimary}>
          <Plus className="h-4 w-4" /> Add Service
        </Link>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          This list also powers the <strong>Programs</strong> dropdown in the website&apos;s main navigation and the{" "}
          <strong>/services</strong> page — drag rows by the handle to reorder, and it saves automatically. Only{" "}
          <strong>Published</strong> services appear on the site.
        </p>
      </div>

      <div className={cardClass}>
        {loading ? (
          <p className="p-8 text-sm text-slate-400">Loading services…</p>
        ) : services.length === 0 ? (
          <p className="p-8 text-sm text-slate-400">No services yet. Add your first one to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium w-8"></th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, index) => (
                <tr
                  key={s._id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "border-b border-slate-100 last:border-0 transition-colors",
                    overIndex === index && "bg-slate-50",
                    savingOrder && "opacity-70"
                  )}
                >
                  <td className="px-5 py-3.5">
                    <span className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500" title="Drag to reorder">
                      <GripVertical className="h-4 w-4" />
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                        <Icon name={s.icon} className="h-4 w-4 text-slate-600" />
                      </span>
                      <span className="font-medium text-slate-800">{s.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{s.order}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                        s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {s.active ? "Published" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/services/${s.slug}`} target="_blank" className={`${btnGhost} !px-2 !py-1.5`} title="View on site">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Link href={`/admin/services/${s._id}`} className={`${btnGhost} !px-2 !py-1.5`} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDuplicate(s._id)} className={`${btnGhost} !px-2 !py-1.5`} title="Duplicate">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className={`${btnGhost} !px-2 !py-1.5 hover:!bg-red-50 hover:!text-red-600`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
