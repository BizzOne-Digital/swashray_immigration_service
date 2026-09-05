/**
 * Plain-JavaScript version of add-service-images.ts — no TypeScript, no
 * esbuild/tsx. Use this one if `npm run add-images` fails with an esbuild
 * "wrong platform" error (this happens when node_modules was installed on
 * a different OS/architecture than the shell you're running the script
 * from — e.g. project set up on Windows, script run from a Linux bridge).
 *
 * Does exactly the same thing as add-service-images.ts: uploads
 * scripts/generated-images/*.jpg into MongoDB via GridFS and attaches each
 * one to its matching Service document (by slug). Safe to re-run — skips
 * services that already have an image unless --force is passed.
 *
 * Usage: node scripts/add-service-images.cjs
 *        node scripts/add-service-images.cjs --force
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const fs = require("fs");
const mongoose = require("mongoose");
const { Readable } = require("stream");

const IMAGE_DIR = path.resolve(process.cwd(), "scripts/generated-images");

const IMAGE_MAP = {
  "visitor-visa": "visitor-visa.jpg",
  sponsorship: "sponsorship.jpg",
  "work-permits": "work-permits.jpg",
  "study-permits": "study-permits.jpg",
  "passport-services": "passport-services.jpg",
  citizenship: "citizenship.jpg",
};

// Minimal schemas mirroring src/lib/models/Service.ts and Media.ts closely
// enough to read/write the same collections and fields.
const ServiceSchema = new mongoose.Schema(
  { slug: String, title: String, featuredImageMediaId: mongoose.Schema.Types.ObjectId },
  { strict: false, timestamps: true }
);
const MediaSchema = new mongoose.Schema(
  { filename: String, mimeType: String, size: Number, gridFsId: mongoose.Schema.Types.ObjectId, altText: String },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
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

  return Media.create({
    filename,
    mimeType: "image/jpeg",
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

  for (const [slug, filename] of Object.entries(IMAGE_MAP)) {
    const service = await Service.findOne({ slug });
    if (!service) {
      console.log(`Skip: no service found with slug "${slug}".`);
      continue;
    }
    if (service.featuredImageMediaId && !force) {
      console.log(`Skip: "${service.title}" already has an image (use --force to replace).`);
      continue;
    }

    const filePath = path.join(IMAGE_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`Skip: image file not found: ${filePath}`);
      continue;
    }

    const media = await uploadMedia(filePath, filename, `${service.title} — illustration`);
    service.featuredImageMediaId = media._id;
    await service.save();
    console.log(`OK: "${service.title}" <- ${filename} (media ${media._id})`);
  }

  console.log("\nDone. Refresh the Services page to see the images.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
