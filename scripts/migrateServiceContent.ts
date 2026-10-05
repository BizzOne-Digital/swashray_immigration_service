/**
 * One-time (idempotent — safe to re-run) migration that copies the
 * hand-written service/program content from src/lib/servicesData/*.ts into
 * the new admin-editable ServiceCategoryContent collection.
 *
 * Run with:  npx tsx scripts/migrateServiceContent.ts
 *
 * Idempotent via upsert-by-slug, so re-running after editing the static
 * files (to pull in a content fix) won't create duplicates — it will,
 * however, overwrite any admin edits made in the meantime, so this should
 * only be re-run before the admin starts editing, not after.
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
import mongoose from "mongoose";
import { CATEGORIES, ALL_SERVICES } from "../src/lib/servicesData";
import ServiceCategoryContent from "../src/lib/models/ServiceCategoryContent";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (check .env.local)");
  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, "//***@")}`);

  let created = 0;
  let updated = 0;

  for (const [categoryIndex, category] of CATEGORIES.entries()) {
    const services = ALL_SERVICES.filter((s) => s.categorySlug === category.slug).map((s, serviceIndex) => ({
      slug: s.slug,
      title: s.title,
      shortDescription: s.shortDescription,
      suitableFor: s.suitableFor,
      icon: s.icon,
      image: s.image,
      imageMediaId: null,
      overview: s.overview,
      eligibility: s.eligibility,
      process: s.process,
      documents: s.documents,
      commonIssues: s.commonIssues,
      howWeHelp: s.howWeHelp,
      faq: s.faq,
      relatedSlugs: s.relatedSlugs,
      seoTitle: s.seoTitle,
      seoDescription: s.seoDescription,
      order: serviceIndex,
      programs: (s.programs || []).map((p, programIndex) => ({
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        suitableFor: p.suitableFor,
        icon: p.icon,
        image: p.image,
        imageMediaId: null,
        overview: p.overview,
        eligibility: p.eligibility,
        process: p.process,
        documents: p.documents,
        commonIssues: p.commonIssues,
        howWeHelp: p.howWeHelp,
        keyConsiderations: p.keyConsiderations,
        faq: p.faq,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        order: programIndex,
      })),
    }));

    const doc = {
      slug: category.slug,
      title: category.title,
      shortDescription: category.shortDescription,
      intro: category.intro,
      icon: category.icon,
      image: category.image,
      imageMediaId: null,
      order: categoryIndex,
      services,
    };

    const res = await ServiceCategoryContent.updateOne(
      { slug: category.slug },
      { $set: doc },
      { upsert: true }
    );
    if (res.upsertedCount > 0) created++;
    else updated++;
    console.log(`  ${res.upsertedCount > 0 ? "created" : "updated"}: ${category.slug} (${services.length} services, ${services.reduce((n, s) => n + s.programs.length, 0)} programs)`);
  }

  console.log(`\nDone. ${created} categories created, ${updated} updated.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
