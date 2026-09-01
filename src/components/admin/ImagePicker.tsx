"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageOff } from "lucide-react";
import { btnSecondary, btnGhost } from "@/lib/adminUi";

export function ImagePicker({
  label,
  value,
  onChange,
  aspect = "aspect-video",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (mediaId: string | null) => void;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.media._id);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className={`relative ${aspect} w-full max-w-sm rounded-lg border border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center`}>
        {value ? (
          <Image src={`/api/media/${value}`} alt={label} fill className="object-cover" />
        ) : (
          <ImageOff className="h-8 w-8 text-slate-300" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2 mt-3">
        <button type="button" className={btnSecondary} onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4" /> {value ? "Replace Image" : "Upload Image"}
        </button>
        {value && (
          <button type="button" className={btnGhost} onClick={() => onChange(null)}>
            <X className="h-4 w-4" /> Remove
          </button>
        )}
      </div>
    </div>
  );
}
