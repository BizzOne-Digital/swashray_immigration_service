/**
 * Uploads the two brand-mark images in scripts/brand-assets/ into MongoDB via
 * GridFS and sets them as the site's logo (full lockup — used in the header
 * and footer) and favicon (the cropped circular emblem — used in the browser
 * tab, since a wide lockup would be squashed at favicon size).
 *
 * Plain JavaScript (no TypeScript/tsx build step) so it runs anywhere Node
 * runs, regardless of what platform node_modules was installed for.
 *
 * Safe to re-run: pass --force to replace an already-set logo/favicon;
 * without it, an already-set one is left alone.
 *
 * Usage: node scripts/update-logo.cjs
 *        node scripts/update-logo.cjs --force
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const fs = require("fs");
const mongoose = require("mongoose");
const { Readable } = require("stream");

const ASSETS_DIR = path.resolve(process.cwd(), "scripts/brand-assets");

const SiteSettingsSchema = new mongoose.Schema(
  { logoMediaId: mongoose.Schema.Types.ObjectId, faviconMediaId: mongoose.Schema.Types.ObjectId },
  { strict: false, timestamps: true }
);
const MediaSchema = new mongoose.Schema(
  { filename: String, mimeType: String, size: Number, gridFsId: mongoose.Schema.Types.ObjectId, altText: String },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const SiteSettings = mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);
const Media = mongoose.models.Media || mongoose.model("Media", MediaSchema);

async function uploadMedia(filePath, filename, altText) {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "media" });
  const buffer = fs.readFileSync(filePath);
  const gridFsId = new mongoose.Types.ObjectId();

  await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(gridFsId, filename, {
      metadata: { contentType: "image/png" },
    });
    Readable.from(buffer).pipe(uploadStream).on("error", reject).on("finish", () => resolve());
  });

  return Media.create({
    filename,
    mimeType: "image/png",
    size: buffer.length,
    gridFsId,
    altText: altText || "",
  });
}

async function main() {
  const force = process.argv.includes("--force");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Check your .env.local file.");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  let settings = await SiteSettings.findOne();
  if (!settings) {
    console.error("No SiteSettings document found — run `npm run seed` first.");
    process.exit(1);
  }

  const jobs = [
    { field: "logoMediaId", file: "logo-full.png", label: "RCIC-IRB logo (full)" },
    { field: "faviconMediaId", file: "logo-icon-square.png", label: "RCIC-IRB emblem (favicon)" },
  ];

  for (const job of jobs) {
    if (settings[job.field] && !force) {
      console.log(`Skip: ${job.field} is already set (use --force to replace).`);
      continue;
    }
    const filePath = path.join(ASSETS_DIR, job.file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skip: image file not found: ${filePath}`);
      continue;
    }
    const media = await uploadMedia(filePath, job.file, job.label);
    settings[job.field] = media._id;
    console.log(`OK: ${job.field} <- ${job.file} (media ${media._id})`);
  }

  await settings.save();
  console.log("\nDone. Refresh the site to see the new logo (hard-refresh for the favicon).");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
