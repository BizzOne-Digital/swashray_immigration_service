/**
 * Reformats each service's "process" field from a single freeform sentence
 * into a newline-separated list of general, generic process steps, which
 * the service detail page (src/app/(site)/services/[slug]/page.tsx) now
 * renders as a numbered step-by-step list instead of one paragraph.
 *
 * The wording here is intentionally generic and procedural — standard
 * "here is roughly how this kind of engagement unfolds" language, not a
 * claim about outcomes, timelines, approval odds, or anything client- or
 * case-specific. Nothing here should be treated as final; the admin can
 * edit any service's process at any time from Admin -> Services.
 *
 * Uses Model.updateOne($set) rather than load-mutate-.save() — see
 * scripts/update-content-defaults.cjs for why that matters in this
 * project's Mongoose version.
 *
 * Usage:
 *   node scripts/update-service-process-steps.cjs            # preview only
 *   node scripts/update-service-process-steps.cjs --apply     # write changes
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const mongoose = require("mongoose");

const STEPS_BY_SLUG = {
  "visitor-visa": [
    "We review your travel purpose, ties to your home country, and general eligibility for a Canadian visitor visa.",
    "We walk you through the documents typically required and what a well-organized application looks like.",
    "We help you prepare and organize your application package for submission.",
    "We stay available for questions while your application is with IRCC.",
  ],
  sponsorship: [
    "We review your relationship and general eligibility under the applicable sponsorship category.",
    "We explain the financial and documentary requirements involved in sponsorship.",
    "We help you prepare and organize the sponsorship application package.",
    "We provide guidance on next steps once the application is submitted.",
  ],
  "work-permits": [
    "We assess your job offer or work situation against the available work permit pathways.",
    "We explain which supporting documents, and where applicable LMIA requirements, apply to your case.",
    "We help you prepare a complete work permit application package.",
    "We answer questions and provide guidance as your application moves forward.",
  ],
  "study-permits": [
    "We review your study plans, program of choice, and general eligibility for a study permit.",
    "We explain the financial and documentary requirements, including proof of funds.",
    "We help you prepare and organize your study permit application.",
    "We remain available to answer questions while your application is in progress.",
  ],
  "passport-services": [
    "We review your situation and the type of passport service you need.",
    "We explain the documents and steps required for your specific request.",
    "We help you complete the necessary forms and prepare your submission.",
    "We provide guidance until your request is resolved.",
  ],
  citizenship: [
    "We review your residency history and general eligibility for Canadian citizenship.",
    "We explain the documentation and testing requirements that may apply to your case.",
    "We help you prepare and organize your citizenship application.",
    "We provide guidance through to your citizenship ceremony.",
  ],
};

const ServiceSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

async function main() {
  const apply = process.argv.includes("--apply");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Check your .env.local file.");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB${apply ? "" : " (DRY RUN — pass --apply to write changes)"}.\n`);

  let changed = 0;
  for (const [slug, steps] of Object.entries(STEPS_BY_SLUG)) {
    const service = await Service.findOne({ slug }).lean();
    if (!service) {
      console.log(`${slug}: no matching service found — skipping.`);
      continue;
    }
    const newProcess = steps.join("\n");
    const currentLines = (service.process || "").split("\n").map((s) => s.trim()).filter(Boolean);
    if (currentLines.length > 1) {
      console.log(`${slug}: process already has multiple lines — leaving as-is (admin may have already edited it).`);
      continue;
    }
    console.log(`${slug}:`);
    console.log(`  before: ${JSON.stringify(service.process)}`);
    console.log(`  after:  ${steps.length} steps`);
    changed++;
    if (apply) {
      await Service.updateOne({ _id: service._id }, { $set: { process: newProcess } });
    }
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
