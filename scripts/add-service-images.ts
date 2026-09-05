/**
 * Uploads the professionally-designed service images (scripts/generated-images/*.jpg)
 * into MongoDB via GridFS and attaches each one to its matching Service document
 * (matched by slug), so they appear on the Services page and homepage.
 *
 * Safe to re-run: if a service already has an image attached, it's skipped
 * unless --force is passed (useful if you regenerate the images later).
 *
 * Usage: npm run add-images
 *        npm run add-images -- --force
 */
import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

import fs from "fs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import Service from "../src/lib/models/Service";
import { uploadMedia } from "../src/lib/media";

const IMAGE_DIR = path.resolve(process.cwd(), "scripts/generated-images");

const IMAGE_MAP: Record<string, string> = {
  "visitor-visa": "visitor-visa.jpg",
  sponsorship: "sponsorship.jpg",
  "work-permits": "work-permits.jpg",
  "study-permits": "study-permits.jpg",
  "passport-services": "passport-services.jpg",
  citizenship: "citizenship.jpg",
};

async function main() {
  const force = process.argv.includes("--force");
  await connectDB();

  for (const [slug, filename] of Object.entries(IMAGE_MAP)) {
    const service = await Service.findOne({ slug });
    if (!service) {
      console.log(`⏭  No service found with slug "${slug}" — skipping.`);
      continue;
    }
    if (service.featuredImageMediaId && !force) {
      console.log(`⏭  "${service.title}" already has an image — skipping (use --force to replace).`);
      continue;
    }

    const filePath = path.join(IMAGE_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Image file not found: ${filePath} — skipping.`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const file = new File([new Uint8Array(buffer)], filename, { type: "image/jpeg" });
    const media = await uploadMedia(file, `${service.title} — illustration`);

    service.featuredImageMediaId = media._id as mongoose.Types.ObjectId;
    await service.save();

    console.log(`✅  "${service.title}" ← ${filename} (media ${media._id})`);
  }

  console.log("\nDone. Refresh the Services page to see the images.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
