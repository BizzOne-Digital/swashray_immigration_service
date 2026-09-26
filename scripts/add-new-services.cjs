/**
 * Creates 4 new Service documents to round out the services list per the
 * client brief's "Services List: Inspiration website" requirement (the
 * reference site lists 9 program categories in its Programs menu; the site
 * previously had 6). These 4 are genuinely-written, generic/informational
 * content in the same tone as the existing 6 services — NOT copied from any
 * competitor site, and NOT containing any fabricated client-specific claims,
 * pricing, or credentials.
 *
 * New services (continuing order from the existing max of 5):
 *   6. Express Entry & Provincial Nominee Program (PNP)  — icon: Globe2
 *   7. Business Immigration                              — icon: Handshake
 *   8. Refugee Protection                                — icon: ShieldCheck
 *   9. PR Card Services, Travel Documents & Appeals       — icon: Scale
 *
 * Each is created with active:true, empty faq/seo (admin-editable later),
 * and a real, freely-licensed Unsplash photo (Unsplash License — free for
 * commercial use, no attribution required) uploaded via GridFS:
 *   - express-entry-pnp.jpg               : person working at a laptop —
 *                                            photo-1664575197229-3bbebc281874
 *   - business-immigration.jpg            : two professionals high-fiving —
 *                                            photo-1600880292203-757bb62b4baf
 *                                            (krakenimages)
 *   - refugee-protection.jpg              : hands joined together in unity —
 *                                            photo-1630068846062-3ffe78aa5049
 *   - pr-card-travel-documents-appeals.jpg: passport & boarding pass flat lay
 *                                            — photo-1586441133374-ed1cb4007a47
 *
 * Uses Model.updateOne/create (not load-mutate-.save()), matching the
 * project's established Mongoose pattern for strict:false schemas.
 *
 * Usage:
 *   node scripts/add-new-services.cjs            # preview only
 *   node scripts/add-new-services.cjs --apply     # write changes
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

const NEW_SERVICES = [
  {
    title: "Express Entry & Provincial Nominee Program (PNP)",
    slug: "express-entry-pnp",
    shortDescription: "Guidance on Canada's Express Entry system and Provincial Nominee Programs for skilled workers.",
    description:
      "General guidance on permanent residence pathways for skilled workers, including the federal Express Entry system (Federal Skilled Worker, Canadian Experience Class, and Federal Skilled Trades programs) and Provincial Nominee Programs (PNP), which allow provinces and territories to nominate candidates who meet their specific labour market needs.",
    whoItsFor: "Skilled workers exploring permanent residence through Express Entry or a provincial nomination.",
    process:
      "We review your education, work experience, and language test results to assess your eligibility.\nWe help identify which Express Entry program or provincial stream best fits your profile.\nWe assist with profile creation, supporting documents, and application submission.\nWe provide guidance through to a final decision on your application.",
    icon: "Globe2",
    image: { file: "express-entry-pnp.jpg", alt: "Professional working at a laptop reviewing documents" },
    order: 6,
  },
  {
    title: "Business Immigration",
    slug: "business-immigration",
    shortDescription: "Support for entrepreneurs and investors exploring business-based immigration pathways to Canada.",
    description:
      "General guidance for entrepreneurs, investors, and self-employed individuals exploring Canadian immigration pathways connected to business ownership, investment, or entrepreneurship, including federal and provincial entrepreneur streams.",
    whoItsFor: "Entrepreneurs, investors, and self-employed individuals considering a business-based pathway.",
    process:
      "We discuss your business background and goals to identify potentially suitable pathways.\nWe explain the general eligibility criteria and documentation typically required.\nWe assist with preparing your application and supporting business documentation.\nWe provide guidance as your application progresses.",
    icon: "Handshake",
    image: { file: "business-immigration.jpg", alt: "Two professionals celebrating a successful business outcome" },
    order: 7,
  },
  {
    title: "Refugee Protection",
    slug: "refugee-protection",
    shortDescription: "Compassionate, confidential guidance for individuals seeking refugee protection in Canada.",
    description:
      "Confidential, compassionate guidance for individuals seeking refugee protection in Canada, including claims made at a port of entry or inland, and an overview of what the refugee protection process generally involves.",
    whoItsFor: "Individuals seeking asylum or refugee protection in Canada.",
    process:
      "We listen to your situation in a confidential and supportive setting.\nWe explain the general refugee protection process and what to expect.\nWe help you understand the documentation and evidence typically involved.\nWe provide guidance and support as your claim proceeds.",
    icon: "ShieldCheck",
    image: { file: "refugee-protection.jpg", alt: "Hands joined together in a circle, symbolizing unity and support" },
    order: 8,
  },
  {
    title: "PR Card Services, Travel Documents & Appeals",
    slug: "pr-card-travel-documents-appeals",
    shortDescription: "Assistance with PR card renewals, travel documents, and immigration appeals.",
    description:
      "General guidance on Permanent Resident (PR) card applications and renewals, permanent resident travel documents for those outside Canada, and an overview of the appeals process for certain immigration decisions.",
    whoItsFor: "Permanent residents needing a PR card or travel document, or individuals considering an appeal.",
    process:
      "We assess your current status and identify the service you need.\nWe explain the documentation and residency requirements that generally apply.\nWe help you prepare and submit a complete application or appeal package.\nWe keep you informed as your matter proceeds.",
    icon: "Scale",
    image: { file: "pr-card-travel-documents-appeals.jpg", alt: "Passport and boarding pass laid out, ready for travel" },
    order: 9,
  },
];

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
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Check your .env.local file.");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB${apply ? "" : " (DRY RUN — pass --apply to write changes)"}.\n`);

  let created = 0;
  for (const svc of NEW_SERVICES) {
    const existing = await Service.findOne({ slug: svc.slug }).lean();
    if (existing) {
      console.log(`  = ${svc.slug}: already exists (_id ${existing._id}) — skipping`);
      continue;
    }
    const filePath = path.join(IMAGE_DIR, svc.image.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ! ${svc.slug}: expected image ${svc.image.file} not found, skipping`);
      continue;
    }
    console.log(`  * ${svc.slug}: will create (order ${svc.order}, icon ${svc.icon}) with photo ${svc.image.file}`);
    if (apply) {
      const mediaId = await uploadMedia(filePath, svc.image.file, svc.image.alt);
      const doc = await Service.create({
        title: svc.title,
        slug: svc.slug,
        shortDescription: svc.shortDescription,
        description: svc.description,
        whoItsFor: svc.whoItsFor,
        process: svc.process,
        featuredImageMediaId: mediaId,
        images: [],
        icon: svc.icon,
        ctaText: "Book a Consultation",
        ctaUrl: "/booking",
        faq: [],
        order: svc.order,
        active: true,
        seo: { title: "", description: "" },
      });
      console.log(`      created _id=${doc._id}, featuredImageMediaId=${mediaId}`);
    }
    created++;
  }

  console.log(`\n${apply ? "Created" : "Would create"} ${created} new service(s).`);
  if (!apply) console.log("Re-run with --apply to write these changes.");

  const total = await Service.countDocuments();
  console.log(`Total services in DB: ${total}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
