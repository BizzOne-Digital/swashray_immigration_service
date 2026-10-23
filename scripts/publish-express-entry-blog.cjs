// Publish the prepared article and banner through the site's existing MongoDB CMS.
// Safe to rerun: an existing article with this slug is left unchanged.
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true });

const article = require("../content/news/express-entry-reform-november-2026.json");
const filename = "express-entry-november-2026-swashray.webp";
const imagePath = path.resolve(__dirname, "../public/images/blog", filename);

async function main() {
  if (!fs.existsSync(imagePath)) throw new Error("The prepared blog banner is missing.");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const articles = db.collection("newsarticles");
  const existing = await articles.findOne({ slug: article.slug });
  if (existing) {
    console.log(`Article already exists (${existing.status}): /news/${article.slug}`);
    return;
  }

  let media = await db.collection("media").findOne({ filename });
  if (!media) {
    const buffer = fs.readFileSync(imagePath);
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "media" });
    const gridFsId = new mongoose.Types.ObjectId();
    await new Promise((resolve, reject) => {
      const stream = bucket.openUploadStreamWithId(gridFsId, filename, {
        metadata: { contentType: "image/webp" },
      });
      stream.on("error", reject).on("finish", resolve);
      Readable.from(buffer).pipe(stream);
    });
    media = {
      _id: new mongoose.Types.ObjectId(), filename, mimeType: "image/webp",
      size: buffer.length, gridFsId, createdAt: new Date(),
      altText: "Swashray Immigration: Express Entry changes scheduled for November 3, 2026",
    };
    await db.collection("media").insertOne(media);
  }

  const now = new Date();
  await articles.updateOne({ slug: article.slug }, { $setOnInsert: {
    ...article, publishedAt: new Date(article.publishedAt),
    featuredImageMediaId: media._id, createdAt: now, updatedAt: now,
  } }, { upsert: true });
  const saved = await articles.findOne({ slug: article.slug });
  if (saved?.status !== "published" || !saved.featuredImageMediaId) {
    throw new Error("Article verification failed.");
  }
  console.log(`Published and verified: /news/${article.slug}`);
}

main().catch((error) => {
  // Connection errors can contain credentials or host details; keep output private.
  console.error(`Blog publication failed (${error.name}). Check database access and the prepared banner.`);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
