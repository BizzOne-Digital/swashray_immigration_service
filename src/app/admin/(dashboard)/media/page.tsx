"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Copy } from "lucide-react";
import { cardClass, btnPrimary, btnGhost } from "@/lib/adminUi";

interface MediaItem {
  _id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setMedia(data.media || []);
    } catch {
      toast.error("Could not load media library.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    toast.success("Upload complete.");
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image? This cannot be undone. Make sure it isn't used elsewhere on the site.")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      setMedia((prev) => prev.filter((m) => m._id !== id));
      toast.success("Image deleted.");
    } catch {
      toast.error("Could not delete image.");
    }
  }

  function copyUrl(id: string) {
    const url = `${window.location.origin}/api/media/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied.");
  }

  const filtered = media.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">Media Library</h1>
          <p className="text-sm text-slate-500 mt-1">Upload and manage images used across the website.</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button className={btnPrimary} onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Images
          </button>
        </div>
      </div>

      <input
        placeholder="Search by filename…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading media…</p>
      ) : filtered.length === 0 ? (
        <div className={`${cardClass} p-12 text-center`}>
          <p className="text-sm text-slate-500">
            {media.length === 0 ? "No images uploaded yet." : "No images match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((m) => (
            <div key={m._id} className={`${cardClass} overflow-hidden group`}>
              <div className="relative aspect-square bg-slate-100">
                <Image src={`/api/media/${m._id}`} alt={m.filename} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-slate-700 truncate" title={m.filename}>
                  {m.filename}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{(m.size / 1024).toFixed(0)} KB</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => copyUrl(m._id)} className={`${btnGhost} !px-2 !py-1 flex-1`} title="Copy URL">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m._id)}
                    className={`${btnGhost} !px-2 !py-1 flex-1 hover:!bg-red-50 hover:!text-red-600`}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
