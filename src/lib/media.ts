import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Media from "@/lib/models/Media";
import { Readable } from "stream";

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export class MediaUploadError extends Error {}

async function getBucket() {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database connection not ready");
  return new mongoose.mongo.GridFSBucket(db, { bucketName: "media" });
}

export async function uploadMedia(file: File, altText = "") {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new MediaUploadError("Unsupported file type. Please upload a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new MediaUploadError("File is too large. Maximum size is 8MB.");
  }

  const bucket = await getBucket();
  const buffer = Buffer.from(await file.arrayBuffer());

  const gridFsId = new mongoose.Types.ObjectId();

  await new Promise<void>((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(gridFsId, file.name, {
      metadata: { contentType: file.type },
    });
    Readable.from(buffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve());
  });

  const media = await Media.create({
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    gridFsId,
    altText,
  });

  return media;
}

export async function deleteMedia(mediaId: string) {
  await connectDB();
  const media = await Media.findById(mediaId);
  if (!media) return;
  const bucket = await getBucket();
  try {
    await bucket.delete(media.gridFsId);
  } catch {
    // file chunk may already be missing; ignore and continue removing metadata
  }
  await Media.findByIdAndDelete(mediaId);
}

export async function openDownloadStream(gridFsId: mongoose.Types.ObjectId) {
  const bucket = await getBucket();
  return bucket.openDownloadStream(gridFsId);
}
