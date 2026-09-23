/**
 * Pushes the new required CMS text (client-supplied About Us paragraph, the
 * exact "Canadian Immigration Consultancy | Swashray Immigration Services"
 * headline/SEO title, the new calculator/booking homepage copy, and the
 * trust badge caption) into whatever About/Home/SiteSettings singleton
 * documents already exist in the database.
 *
 * Why this script exists: changing a Mongoose schema's `default:` only
 * affects documents created AFTER the change. It does not retroactively
 * update a document that was already created (e.g. by `npm run seed`)
 * before this content was added — that document keeps its old values
 * forever unless something explicitly rewrites them. This script is that
 * explicit rewrite.
 *
 * Plain JavaScript (no TypeScript/tsx build step) so it runs anywhere Node
 * runs, regardless of what platform node_modules was installed for.
 *
 * Usage:
 *   node scripts/update-content-defaults.cjs            # preview only
 *   node scripts/update-content-defaults.cjs --apply     # write changes
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const mongoose = require("mongoose");

const ABOUT_INTRO_TEXT =
  "Every immigration case reflects a unique story, a family's aspirations, and an individual's future. At Swashray Immigration Services, we believe every client deserves personalized attention and guidance tailored to their circumstances.\n\n" +
  "We are committed to upholding CICC's professional standards through honest advice, loyalty to our clients, and strict confidentiality. We provide transparent guidance, even when the information may not be what a client hopes to hear.\n\n" +
  "No two immigration cases are alike. We take the time to understand each client's goals, circumstances, and concerns before recommending an appropriate immigration pathway.\n\n" +
  "Our practice is built on integrity, professionalism, and accountability. We strive to ensure that every client feels heard, informed, and supported throughout their immigration journey.";

const HEADLINE = "Canadian Immigration Consultancy | Swashray Immigration Services";
const TRUST_BADGE_TEXT = "Regulated Canadian Immigration Consultant, licensed and authorized by the CICC (RCIC-IRB).";

// Brand-new HomeContent fields added in this phase (calculator + booking
// homepage sections). These simply don't exist on a document created before
// this phase, so — unlike the fields above, which we deliberately overwrite
// — we only ever fill these in when they're missing, never overwrite an
// admin's own edits on a re-run.
const NEW_HOME_FIELD_DEFAULTS = {
  calculatorHeading: "Estimate Your Immigration Score",
  calculatorIntro:
    "Get an informational estimate of your Express Entry Comprehensive Ranking System (CRS) score using the official IRCC point tables, then book a consultation to discuss your options in detail.",
  calculatorCtaText: "Calculate My Score",
  bookingHeading: "Book Your Consultation",
  bookingIntro:
    "Speak directly with our RCIC-IRB licensed consultant about your immigration goals. We'll review your situation, explain your options clearly, and outline the next steps.",
  bookingHighlights: [
    "One-on-one consultation with a Regulated Canadian Immigration Consultant",
    "Clear, honest guidance tailored to your circumstances",
    "Choose a date and time that works for you",
  ],
  bookingCtaText: "Book a Consultation",
  trustHeading: "Regulated & Licensed",
};

// Loose schemas (strict:false) so this script only needs to know about the
// specific fields it touches, regardless of the rest of each document.
const AboutContentSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const HomeContentSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const SiteSettingsSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const AboutContent = mongoose.models.AboutContent || mongoose.model("AboutContent", AboutContentSchema);
const HomeContent = mongoose.models.HomeContent || mongoose.model("HomeContent", HomeContentSchema);
const SiteSettings = mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);

function logChange(label, before, after) {
  if (before === after) {
    console.log(`  = ${label}: unchanged`);
    return false;
  }
  console.log(`  * ${label}:`);
  console.log(`      before: ${JSON.stringify(before)}`);
  console.log(`      after:  ${JSON.stringify(after)}`);
  return true;
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

  let changed = 0;

  // NOTE ON WRITE STRATEGY: this script updates via Model.updateOne($set)
  // rather than load-mutate-.save(). In this project's Mongoose version,
  // assigning a value to a path that isn't declared in the schema — which
  // is every path here, since these are deliberately bare `strict:false`
  // schemas — does NOT reliably register as a modified path for .save() to
  // persist, even when paired with .markModified(). That was verified by
  // hand while writing this script: a .save() after such an assignment
  // silently no-ops, exactly like the known "strict:false drops writes"
  // issue from earlier migration scripts in this project, and unlike a
  // one-off script touching schema-declared fields, .markModified() does
  // not rescue it here. updateOne's $set does persist reliably, so it's
  // used throughout instead.

  // --- AboutContent ---
  const about = await AboutContent.findOne().lean();
  if (about) {
    console.log("AboutContent:");
    const willChange = logChange("introText", about.introText, ABOUT_INTRO_TEXT);
    if (willChange) changed++;
    if (apply && willChange) {
      await AboutContent.updateOne({ _id: about._id }, { $set: { introText: ABOUT_INTRO_TEXT } });
    }
  } else {
    console.log("AboutContent: no document found — skipping (run `npm run seed` first).");
  }

  // --- HomeContent ---
  const home = await HomeContent.findOne().lean();
  if (home) {
    console.log("\nHomeContent:");
    const set = {};
    if (logChange("heroHeadline", home.heroHeadline, HEADLINE)) set.heroHeadline = HEADLINE;
    const currentSeoTitle = home.seo && home.seo.title;
    if (logChange("seo.title", currentSeoTitle, HEADLINE)) set["seo.title"] = HEADLINE;

    const missingFields = Object.keys(NEW_HOME_FIELD_DEFAULTS).filter((key) => home[key] === undefined);
    for (const key of missingFields) {
      logChange(`${key} (new field, currently missing)`, undefined, NEW_HOME_FIELD_DEFAULTS[key]);
      set[key] = NEW_HOME_FIELD_DEFAULTS[key];
    }

    if (Object.keys(set).length > 0) changed++;
    if (apply && Object.keys(set).length > 0) {
      await HomeContent.updateOne({ _id: home._id }, { $set: set });
    }
  } else {
    console.log("\nHomeContent: no document found — skipping (run `npm run seed` first).");
  }

  // --- SiteSettings ---
  const settings = await SiteSettings.findOne().lean();
  if (settings) {
    console.log("\nSiteSettings:");
    const set = {};
    const currentSeoDefaultsTitle = settings.seoDefaults && settings.seoDefaults.title;
    if (logChange("seoDefaults.title", currentSeoDefaultsTitle, HEADLINE)) set["seoDefaults.title"] = HEADLINE;
    if (logChange("trustBadgeText", settings.trustBadgeText, TRUST_BADGE_TEXT)) set.trustBadgeText = TRUST_BADGE_TEXT;

    if (Object.keys(set).length > 0) changed++;
    if (apply && Object.keys(set).length > 0) {
      await SiteSettings.updateOne({ _id: settings._id }, { $set: set });
    }
  } else {
    console.log("\nSiteSettings: no document found — skipping (run `npm run seed` first).");
  }

  console.log(`\n${apply ? "Applied" : "Would apply"} changes to ${changed} document(s).`);
  if (!apply) {
    console.log("Re-run with --apply to write these changes.");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
