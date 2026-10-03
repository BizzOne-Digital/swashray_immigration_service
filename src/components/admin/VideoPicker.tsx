"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2, VideoOff } from "lucide-react";
import { btnSecondary, btnGhost } from "@/lib/adminUi";

/**
 * Same upload pattern as ImagePicker, for the optional background video on
 * a hero slide. Keep clips short and muted — they autoplay on loop behind
 * text, so a small file size matters more than resolution.
 */
export function VideoPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (mediaId: string | null) => void;
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
      toast.success("Video uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative aspect-[16/9] w-full max-w-sm rounded-lg border border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center">
        {value ? (
          <video src={`/api/media/${value}`} className="h-full w-full object-cover" muted loop autoPlay playsInline />
        ) : (
          <VideoOff className="h-8 w-8 text-slate-300" />
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
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2 mt-3">
        <button type="button" className={btnSecondary} onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4" /> {value ? "Replace Video" : "Upload Video"}
        </button>
        {value && (
          <button type="button" className={btnGhost} onClick={() => onChange(null)}>
            <X className="h-4 w-4" /> Remove
          </button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-slate-400">Optional. MP4 or WebM, under 20MB, no sound needed (it plays muted). Falls back to the background image above if not set.</p>
    </div>
  );
}
