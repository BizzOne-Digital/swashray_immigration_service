/**
 * One-time: uploads the background video clips in scripts/hero-videos/ into
 * GridFS as Media documents, then sets videoMediaId on the matching
 * HomeContent.heroSlides entry (matched by slide label). Also backfills the
 * slide's imageMediaId with the clip's poster frame if the slide doesn't
 * already have an image (the "Immigration Guidance You Can Trust" overview
 * slide currently has none).
 *
 * Safe to re-run: it only ever sets videoMediaId/imageMediaId on a slide
 * that doesn't already have that field set from a previous run, so it will
 * never clobber an admin's own upload.
 *
 * Usage: node scripts/upload-hero-videos.cjs
 */
const path = require("path");
const fs = require("fs");

const envPath = path.resolve(process.cwd(), ".env.local");
const envText = fs.readFileSync(envPath, "utf8");
const match = envText.match(/^MONGODB_URI\s*=\s*(.+)$/m);
let uri = match ? match[1].trim() : null;
if (uri && (uri.startsWith('"') || uri.startsWith("'"))) uri = uri.slice(1, -1);
if (!uri) throw new Error("MONGODB_URI not found in .env.local");

const mongoose = require(path.resolve(process.cwd(), "node_modules/mongoose"));

// label -> { video filename, poster filename }
const CLIP_PLAN = {
  "Immigration Guidance You Can Trust": { video: "overview.mp4", poster: "overview.jpg" },
  "Visitor Visa": { video: "visitor_visa.mp4", poster: "visitor_visa.jpg" },
  "Family Sponsorship": { video: "sponsorship.mp4", poster: "sponsorship.jpg" },
  "Study Permits": { video: "study_permits.mp4", poster: "study_permits.jpg" },
  "Take the Final Step to Citizenship": { video: "citizenship.mp4", poster: "citizenship.jpg" },
};

const VIDEO_DIR = path.resolve(process.cwd(), "scripts/hero-videos");

async function uploadFile(bucket, filePath, contentType) {
  const buffer = fs.readFileSync(filePath);
  const gridFsId = new mongoose.Types.ObjectId();
  await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(gridFsId, path.basename(filePath), {
      metadata: { contentType },
    });
    uploadStream.end(buffer);
    uploadStream.on("finish", resolve);
    uploadStream.on("error", reject);
  });
  return { gridFsId, size: buffer.length };
}

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "media" });
  const MediaCollection = db.collection("media");
  const HomeContent = db.collection("homecontents");

  const home = await HomeContent.findOne({});
  if (!home || !Array.isArray(home.heroSlides) || home.heroSlides.length === 0) {
    console.log("No heroSlides found — run scripts/seed-hero-slides.cjs first.");
    process.exit(1);
  }

  const updatedSlides = [];
  for (const slide of home.heroSlides) {
    const plan = CLIP_PLAN[slide.label];
    if (!plan) {
      updatedSlides.push(slide);
      continue;
    }

    const next = { ...slide };

    if (!slide.videoMediaId) {
      const videoPath = path.join(VIDEO_DIR, plan.video);
      if (fs.existsSync(videoPath)) {
        const { gridFsId, size } = await uploadFile(bucket, videoPath, "video/mp4");
        const mediaDoc = await MediaCollection.insertOne({
          filename: plan.video,
          mimeType: "video/mp4",
          size,
          gridFsId,
          altText: "",
          createdAt: new Date(),
        });
        next.videoMediaId = mediaDoc.insertedId;
        console.log(`Uploaded video for "${slide.label}": ${plan.video} (${(size / 1024 / 1024).toFixed(2)}MB)`);
      } else {
        console.log(`Video file not found, skipping: ${videoPath}`);
      }
    }

    if (!slide.imageMediaId) {
      const posterPath = path.join(VIDEO_DIR, plan.poster);
      if (fs.existsSync(posterPath)) {
        const { gridFsId, size } = await uploadFile(bucket, posterPath, "image/jpeg");
        const mediaDoc = await MediaCollection.insertOne({
          filename: plan.poster,
          mimeType: "image/jpeg",
          size,
          gridFsId,
          altText: "",
          createdAt: new Date(),
        });
        next.imageMediaId = mediaDoc.insertedId;
        console.log(`Uploaded poster image for "${slide.label}": ${plan.poster}`);
      }
    }

    updatedSlides.push(next);
  }

  await HomeContent.updateOne({ _id: home._id }, { $set: { heroSlides: updatedSlides } });
  console.log("Done. heroSlides updated with video/poster media ids.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Upload failed:", err.message);
  process.exit(1);
});
