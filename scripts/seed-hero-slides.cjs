/**
 * One-time, idempotent seed for the homepage Hero Slider.
 *
 * Only runs if HomeContent.heroSlides is currently empty, so it will never
 * clobber slides an admin has already edited. Slide copy here is generic,
 * non-fabricated marketing copy for real services already in the database
 * (looked up live by slug, not hardcoded ids) — nothing here invents
 * credentials, prices, or claims about the business.
 *
 * Usage: node scripts/seed-hero-slides.cjs
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

const SLIDE_PLAN = [
  {
    bySlug: null,
    label: "Immigration Guidance You Can Trust",
    heading: "Canadian Immigration Consultancy | Swashray Immigration Services",
    useGlobalSubheading: true,
    ctaText: "Book a Consultation",
    ctaUrl: "/booking",
  },
  {
    bySlug: "visitor-visa",
    label: "Visitor Visa",
    heading: "Plan Your Visit to Canada",
    ctaText: "Learn More",
  },
  {
    bySlug: "sponsorship",
    label: "Family Sponsorship",
    heading: "Reunite With Family in Canada",
    ctaText: "Learn More",
  },
  {
    bySlug: "study-permits",
    label: "Study Permits",
    heading: "Begin Your Studies in Canada",
    ctaText: "Learn More",
  },
  {
    bySlug: "citizenship",
    label: "Take the Final Step to Citizenship",
    heading: "Take the Final Step to Citizenship",
    ctaText: "Learn More",
  },
];

async function main() {
  await mongoose.connect(uri);
  const HomeContent = mongoose.connection.collection("homecontents");
  const Service = mongoose.connection.collection("services");

  const home = await HomeContent.findOne({});
  if (!home) {
    console.log("No HomeContent document found yet — run the app once first (it creates one with defaults).");
    process.exit(1);
  }
  if (Array.isArray(home.heroSlides) && home.heroSlides.length > 0) {
    console.log(`heroSlides already has ${home.heroSlides.length} slide(s) — leaving it alone. Delete them in Admin first if you want to reseed.`);
    process.exit(0);
  }

  const slides = [];
  for (const plan of SLIDE_PLAN) {
    if (plan.useGlobalSubheading) {
      slides.push({
        _id: new mongoose.Types.ObjectId(),
        label: plan.label,
        heading: plan.heading,
        subheading: home.heroSubheading || "",
        imageMediaId: home.heroImageMediaId || null,
        ctaText: plan.ctaText,
        ctaUrl: plan.ctaUrl || "/booking",
      });
      continue;
    }
    const service = await Service.findOne({ slug: plan.bySlug });
    if (!service) {
      console.log(`Service "${plan.bySlug}" not found — skipping that slide.`);
      continue;
    }
    slides.push({
      _id: new mongoose.Types.ObjectId(),
      label: plan.label,
      heading: plan.heading,
      subheading: service.shortDescription || "",
      imageMediaId: service.featuredImageMediaId || null,
      ctaText: plan.ctaText,
      ctaUrl: `/services/${service.slug}`,
    });
  }

  if (slides.length === 0) {
    console.log("No slides could be built — nothing to do.");
    process.exit(1);
  }

  await HomeContent.updateOne({ _id: home._id }, { $set: { heroSlides: slides } });
  console.log(`Seeded ${slides.length} hero slide(s):`);
  for (const s of slides) console.log(` - ${s.label}: "${s.heading}"`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
