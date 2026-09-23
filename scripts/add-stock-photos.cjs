/**
 * Uploads three freely-licensed Unsplash photos (Unsplash License — free for
 * commercial use, no attribution required) into MongoDB via GridFS and wires
 * them into the homepage hero image and the two About page image slots,
 * which were previously empty (falling back to the original brand
 * illustration graphic).
 *
 * These are NOT AI-generated, and NOT pulled from any competitor reference
 * site — they are real, professional stock photography sourced from
 * Unsplash, chosen for Canada/immigration relevance:
 *   - hero-toronto.jpg      : Toronto skyline (CN Tower) with a Canadian flag
 *                              — by Anil Baki Durmus, photo-1744639028880-86dfd3150f30
 *   - about-parliament.jpg  : Canadian flag in front of Parliament Hill's
 *                              Peace Tower, Ottawa — by Jason Hafso,
 *                              photo-1578973615934-8d9cdb0792b4
 *   - about-passport.jpg    : Open passport with international travel stamps
 *                              — by Henry Thong, photo-1581553673739-c4906b5d0de8
 *
 * The admin can replace any of these at any time from Admin -> Content, the
 * same as any other image on the site.
 *
 * Safe to re-run — skips a slot that already has an image unless --force is
 * passed (mirrors scripts/add-service-images.cjs).
 *
 * Usage:
 *   node scripts/add-stock-photos.cjs
 *   node scripts/add-stock-photos.cjs --force
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const fs = require("fs");
const mongoose = require("mongoose");
const { Readable } = require("stream");

const IMAGE_DIR = path.resolve(process.cwd(), "scripts/stock-photos");

const HomeContentSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const AboutContentSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const MediaSchema = new mongoose.Schema(
  { filename: String, mimeType: String, size: Number, gridFsId: mongoose.Schema.Types.ObjectId, altText: String },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const HomeContent = mongoose.models.HomeContent || mongoose.model("HomeContent", HomeContentSchema);
const AboutContent = mongoose.models.AboutContent || mongoose.model("AboutContent", AboutContentSchema);
const Media = mongoose.models.Media || mongoose.model("Media", MediaSchema);

async function uploadMedia(filePath, filename, altText) {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "media" });
  const buffer = fs.readFileSync(filePath);
  const gridFsId = new mongoose.Types.ObjectId();

  await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(gridFsId, filename, {
      metadata: { contentType: "image/jpeg" },
    });
    Readable.from(buffer).pipe(uploadStream).on("error", reject).on("finish", () => resolve());
  });

  const media = await Media.create({
    filename,
    mimeType: "image/jpeg",
    size: buffer.length,
    gridFsId,
    altText: altText || "",
  });
  return media._id;
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

  const home = await HomeContent.findOne().lean();
  const about = await AboutContent.findOne().lean();

  if (home) {
    if (!home.heroImageMediaId || force) {
      const id = await uploadMedia(
        path.join(IMAGE_DIR, "hero-toronto.jpg"),
        "hero-toronto.jpg",
        "Toronto skyline with the Canadian flag"
      );
      await HomeContent.updateOne({ _id: home._id }, { $set: { heroImageMediaId: id } });
      console.log(`HomeContent.heroImageMediaId <- ${id}`);
    } else {
      console.log("HomeContent.heroImageMediaId already set — skipping (use --force to replace).");
    }
  } else {
    console.log("HomeContent: no document found — skipping.");
  }

  if (about) {
    const set = {};
    if (!about.introImageMediaId || force) {
      set.introImageMediaId = await uploadMedia(
        path.join(IMAGE_DIR, "about-parliament.jpg"),
        "about-parliament.jpg",
        "Canadian flag in front of Parliament Hill's Peace Tower, Ottawa"
      );
      console.log(`AboutContent.introImageMediaId <- ${set.introImageMediaId}`);
    } else {
      console.log("AboutContent.introImageMediaId already set — skipping (use --force to replace).");
    }
    if (!about.approachImageMediaId || force) {
      set.approachImageMediaId = await uploadMedia(
        path.join(IMAGE_DIR, "about-passport.jpg"),
        "about-passport.jpg",
        "Open passport with international travel stamps"
      );
      console.log(`AboutContent.approachImageMediaId <- ${set.approachImageMediaId}`);
    } else {
      console.log("AboutContent.approachImageMediaId already set — skipping (use --force to replace).");
    }
    if (Object.keys(set).length > 0) {
      await AboutContent.updateOne({ _id: about._id }, { $set: set });
    }
  } else {
    console.log("AboutContent: no document found — skipping.");
  }

  console.log("\nDone. Refresh the site to see the images.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
