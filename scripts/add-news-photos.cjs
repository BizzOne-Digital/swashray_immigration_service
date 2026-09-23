/**
 * Adds real, freely-licensed Unsplash photos (Unsplash License — free for
 * commercial use, no attribution required) to the starter/demo News &
 * Updates articles, which previously had no featuredImageMediaId and so
 * rendered as an empty box on the News listing page.
 *
 * These are NOT AI-generated, and NOT pulled from any competitor reference
 * site — they are real, professional stock photography:
 *   - welcome.jpg        : Two professionals shaking hands — by Vitaly
 *                           Gariev, photo-1758518730384-be3d205838e8
 *   - verify-sources.jpg : Two colleagues reviewing documents at a desk —
 *                           by Vitaly Gariev, photo-1758611972678-bc3b29b4718f
 *
 * Also note: as of this script, NewsCard and the news detail page now show
 * a BrandIllustration (original code-drawn graphic, not a photo) instead of
 * an empty box whenever an article has no featured image, so future
 * admin-authored articles never look broken while a photo is pending.
 *
 * The admin can replace either image at any time from Admin -> News & Updates.
 *
 * Usage:
 *   node scripts/add-news-photos.cjs            # preview only
 *   node scripts/add-news-photos.cjs --apply     # write changes
 *   node scripts/add-news-photos.cjs --apply --force   # also replace slots that already have an image
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const fs = require("fs");
const mongoose = require("mongoose");
const { Readable } = require("stream");

const IMAGE_DIR = path.resolve(process.cwd(), "scripts/news-photos");

const NewsArticleSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const MediaSchema = new mongoose.Schema(
  { filename: String, mimeType: String, size: Number, gridFsId: mongoose.Schema.Types.ObjectId, altText: String },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const NewsArticle = mongoose.models.NewsArticle || mongoose.model("NewsArticle", NewsArticleSchema);
const Media = mongoose.models.Media || mongoose.model("Media", MediaSchema);

const MAP = {
  "welcome-to-swashray-immigration": { file: "welcome.jpg", alt: "Two professionals shaking hands" },
  "verify-immigration-requirements-official-sources": {
    file: "verify-sources.jpg",
    alt: "Two colleagues reviewing documents at a desk",
  },
};

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
  const apply = process.argv.includes("--apply");
  const force = process.argv.includes("--force");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Check your .env.local file.");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB${apply ? "" : " (DRY RUN — pass --apply to write changes)"}.\n`);

  const articles = await NewsArticle.find().lean();
  let changed = 0;

  for (const art of articles) {
    const entry = MAP[art.slug];
    if (!entry) {
      console.log(`  - ${art.slug}: no mapped photo, skipping`);
      continue;
    }
    const filePath = path.join(IMAGE_DIR, entry.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ! ${art.slug}: expected file ${entry.file} not found, skipping`);
      continue;
    }
    if (art.featuredImageMediaId && !force) {
      console.log(`  = ${art.slug}: featuredImageMediaId already set (${art.featuredImageMediaId}) — skipping (use --force to replace)`);
      continue;
    }
    console.log(`  * ${art.slug}: -> ${entry.file}`);
    if (apply) {
      const id = await uploadMedia(filePath, entry.file, entry.alt);
      await NewsArticle.updateOne({ _id: art._id }, { $set: { featuredImageMediaId: id } });
      console.log(`      uploaded, featuredImageMediaId <- ${id}`);
    }
    changed++;
  }

  console.log(`\n${apply ? "Applied" : "Would apply"} changes to ${changed} article(s).`);
  if (!apply) console.log("Re-run with --apply to write these changes.");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
