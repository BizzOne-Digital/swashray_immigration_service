"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { cardClass, btnPrimary, btnGhost } from "@/lib/adminUi";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface NewsRow {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  isDemo: boolean;
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/news");
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a._id !== id));
      toast.success("Article deleted.");
    } else {
      toast.error("Could not delete article.");
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">News & Updates</h1>
          <p className="text-sm text-slate-500 mt-1">Publish immigration news and updates to the homepage and news page.</p>
        </div>
        <Link href="/admin/news/new" className={btnPrimary}>
          <Plus className="h-4 w-4" /> Add Article
        </Link>
      </div>

      <div className={cardClass}>
        {loading ? (
          <p className="p-8 text-sm text-slate-400">Loading articles…</p>
        ) : articles.length === 0 ? (
          <p className="p-8 text-sm text-slate-400">No articles yet. Add your first one to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{a.title}</span>
                      {a.featured && <span className="text-[10px] font-semibold uppercase bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">Featured</span>}
                      {a.isDemo && <span className="text-[10px] font-semibold uppercase bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">Demo</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{a.category}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {a.status === "published" && (
                        <a href={`/news/${a.slug}`} target="_blank" className={`${btnGhost} !px-2 !py-1.5`} title="View on site">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link href={`/admin/news/${a._id}`} className={`${btnGhost} !px-2 !py-1.5`} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(a._id)}
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
