/**
 * Replaces the 6 starter services' generated teal-gradient icon graphics with
 * real, freely-licensed Unsplash photos (Unsplash License — free for
 * commercial use, no attribution required), uploaded into MongoDB via GridFS.
 *
 * These are NOT AI-generated, and NOT pulled from any competitor reference
 * site — they are real, professional stock photography:
 *   - visitor-visa.jpg       : Traveler holding a Canadian passport at an
 *                               airport — by Kylie Anderson, photo-1545013806-8e1d077550ca
 *   - sponsorship.jpg        : Multigenerational family holding hands
 *                               together — by Thay Jesus, photo-1706200637521-b446bd05df0d
 *   - work-permits.jpg       : Professional working at a laptop — by Tim van
 *                               der Kuip, photo-1551434678-e076c223a692
 *   - study-permits.jpg      : Student on a Canadian university campus — by
 *                               Joshua Song, photo-1621274790572-7c32596bc67f
 *   - passport-services.jpg  : Passport silhouetted against an airplane
 *                               window — by Blake Guidry, photo-1530469525856-cf37954301f7
 *   - citizenship.jpg        : Waving Canadian flag — by Sebastiaan Stam,
 *                               photo-1551009175-15bdf9dcb580
 *
 * The admin can replace any of these at any time from Admin -> Services.
 *
 * Uses Model.updateOne($set) rather than load-mutate-.save(), matching the
 * project's established pattern for strict:false schemas in this Mongoose
 * version (see scripts/update-theme-colors.cjs for the full explanation).
 *
 * Usage:
 *   node scripts/add-service-photos.cjs            # preview only
 *   node scripts/add-service-photos.cjs --apply     # write changes
 *   node scripts/add-service-photos.cjs --apply --force   # also replace slots that already have an image
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const fs = require("fs");
const mongoose = require("mongoose");
const { Readable } = require("stream");

const IMAGE_DIR = path.resolve(process.cwd(), "scripts/service-photos");

const ServiceSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const MediaSchema = new mongoose.Schema(
  { filename: String, mimeType: String, size: Number, gridFsId: mongoose.Schema.Types.ObjectId, altText: String },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Media = mongoose.models.Media || mongoose.model("Media", MediaSchema);

const MAP = {
  "visitor-visa": { file: "visitor-visa.jpg", alt: "Traveler holding a Canadian passport at the airport" },
  sponsorship: { file: "sponsorship.jpg", alt: "Multigenerational family holding hands together" },
  "work-permits": { file: "work-permits.jpg", alt: "Professional working at a laptop" },
  "study-permits": { file: "study-permits.jpg", alt: "Student on a Canadian university campus" },
  "passport-services": { file: "passport-services.jpg", alt: "Passport silhouetted against an airplane window" },
  citizenship: { file: "citizenship.jpg", alt: "Waving Canadian flag" },
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

  const services = await Service.find().lean();
  let changed = 0;

  for (const svc of services) {
    const entry = MAP[svc.slug];
    if (!entry) {
      console.log(`  - ${svc.slug}: no mapped photo, skipping`);
      continue;
    }
    const filePath = path.join(IMAGE_DIR, entry.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ! ${svc.slug}: expected file ${entry.file} not found, skipping`);
      continue;
    }
    if (svc.featuredImageMediaId && !force) {
      console.log(`  = ${svc.slug}: featuredImageMediaId already set (${svc.featuredImageMediaId}) — skipping (use --force to replace)`);
      continue;
    }
    console.log(`  * ${svc.slug}: -> ${entry.file}`);
    if (apply) {
      const id = await uploadMedia(filePath, entry.file, entry.alt);
      await Service.updateOne({ _id: svc._id }, { $set: { featuredImageMediaId: id } });
      console.log(`      uploaded, featuredImageMediaId <- ${id}`);
    }
    changed++;
  }

  console.log(`\n${apply ? "Applied" : "Would apply"} changes to ${changed} service(s).`);
  if (!apply) console.log("Re-run with --apply to write these changes.");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
