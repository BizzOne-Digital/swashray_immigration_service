import slugify from "slugify";
import mongoose from "mongoose";

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function mediaUrl(id: mongoose.Types.ObjectId | string | null | undefined): string | null {
  if (!id) return null;
  return `/api/media/${id.toString()}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
