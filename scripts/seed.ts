/**
 * Seeds the database with:
 *  - the first admin login (from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env.local)
 *  - default singleton content/settings documents
 *  - a starter set of demo services and demo news articles (clearly marked as demo)
 *
 * Usage: npm run seed
 * Safe to re-run: existing content is left alone; the admin password is
 * reset to match .env.local each time you run it (handy if you forget it).
 */
import { config } from "dotenv";
import path from "path";
// Next.js convention: .env.local overrides .env for local development.
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import AdminUser from "../src/lib/models/AdminUser";
import SiteSettings from "../src/lib/models/SiteSettings";
import ThemeSettings from "../src/lib/models/ThemeSettings";
import HomeContent from "../src/lib/models/HomeContent";
import AboutContent from "../src/lib/models/AboutContent";
import BookingSettings from "../src/lib/models/BookingSettings";
import NavigationItem from "../src/lib/models/NavigationItem";
import Service from "../src/lib/models/Service";
import NewsArticle from "../src/lib/models/NewsArticle";

const DEFAULT_NAV = [
  { label: "Home", url: "/", order: 0, visible: true, openInNewTab: false },
  { label: "About Us", url: "/about", order: 1, visible: true, openInNewTab: false },
  { label: "Services", url: "/services", order: 2, visible: true, openInNewTab: false },
  { label: "News", url: "/news", order: 3, visible: true, openInNewTab: false },
  { label: "Booking", url: "/booking", order: 4, visible: true, openInNewTab: false },
  { label: "Contact", url: "/contact", order: 5, visible: true, openInNewTab: false },
];

const DEMO_SERVICES = [
  {
    title: "Visitor Visa",
    slug: "visitor-visa",
    shortDescription: "Guidance for individuals planning to visit Canada.",
    description:
      "General guidance for individuals who wish to visit Canada, including an overview of what a visitor visa application typically involves.",
    whoItsFor: "Individuals planning a temporary visit to Canada for tourism, family, or business purposes.",
    process: "We discuss your travel plans, review what documentation is generally required, and guide you through next steps.",
    icon: "Plane",
    order: 0,
  },
  {
    title: "Sponsorship",
    slug: "sponsorship",
    shortDescription: "Information and assistance for eligible sponsorship pathways.",
    description: "General guidance regarding family and other sponsorship pathways that may be available.",
    whoItsFor: "Canadian citizens or permanent residents exploring sponsorship options for eligible family members.",
    process: "We review your situation, discuss general eligibility considerations, and outline the documentation typically involved.",
    icon: "Users",
    order: 1,
  },
  {
    title: "Work Permits",
    slug: "work-permits",
    shortDescription: "Professional guidance related to work permit applications.",
    description: "General guidance related to work permit pathways and what the process typically involves.",
    whoItsFor: "Individuals seeking to work in Canada on a temporary basis.",
    process: "We discuss your employment situation and provide general guidance on the relevant pathway.",
    icon: "Briefcase",
    order: 2,
  },
  {
    title: "Study Permits",
    slug: "study-permits",
    shortDescription: "Support and information for students planning to study in Canada.",
    description: "General guidance for individuals planning to study at a Canadian institution.",
    whoItsFor: "Prospective international students planning to study in Canada.",
    process: "We discuss your study plans and provide general guidance on the study permit process.",
    icon: "GraduationCap",
    order: 3,
  },
  {
    title: "Passport Services",
    slug: "passport-services",
    shortDescription: "Information and assistance related to passport services.",
    description: "General information and assistance related to passport-related matters.",
    whoItsFor: "Individuals who need guidance on passport-related processes.",
    process: "We discuss your situation and provide general guidance on next steps.",
    icon: "Stamp",
    order: 4,
  },
  {
    title: "Citizenship",
    slug: "citizenship",
    shortDescription: "Information and guidance regarding citizenship processes.",
    description: "General information and guidance regarding the citizenship process.",
    whoItsFor: "Permanent residents who may be exploring the citizenship process.",
    process: "We discuss your situation and provide general guidance on the citizenship process.",
    icon: "Award",
    order: 5,
  },
];

const DEMO_NEWS = [
  {
    title: "Welcome to the New Swashray Immigration Website",
    slug: "welcome-to-swashray-immigration",
    excerpt: "We're excited to launch our new website — here's what you can find here.",
    content:
      "This is demo content added during setup. Replace or remove it from Admin → News & Updates.\n\nOur new website makes it easier to learn about our services, book a consultation, and stay up to date with general immigration news and updates.",
    category: "General Updates",
    author: "Swashray Immigration Team",
    isDemo: true,
    featured: true,
    status: "published" as const,
  },
  {
    title: "Always Verify Immigration Requirements With Official Sources",
    slug: "verify-immigration-requirements-official-sources",
    excerpt: "Immigration rules and requirements change often — here's why it matters.",
    content:
      "This is demo content added during setup. Replace or remove it from Admin → News & Updates.\n\nImmigration policies, fees, and processing times can change without notice. We always recommend verifying current details with official government sources or a qualified immigration professional before making decisions.",
    category: "Important Notices",
    author: "Swashray Immigration Team",
    isDemo: true,
    featured: false,
    status: "published" as const,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in first.");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  // --- Admin user ---
  const email = (process.env.SEED_ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Admin";
  if (!email || !password) {
    console.warn("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user creation.");
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await AdminUser.findOneAndUpdate({ email }, { email, passwordHash, name }, { upsert: true, returnDocument: "after" });
    console.log(`Admin login ready: ${email}`);
  }

  // --- Singleton content/settings docs (created with schema defaults if missing) ---
  await SiteSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true });
  await ThemeSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true });
  await HomeContent.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true });
  await AboutContent.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true });
  await BookingSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true });
  console.log("Default site content ready.");

  // --- Navigation ---
  const navCount = await NavigationItem.countDocuments();
  if (navCount === 0) {
    await NavigationItem.insertMany(DEFAULT_NAV);
    console.log("Default navigation created.");
  }

  // --- Demo services ---
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(DEMO_SERVICES);
    console.log(`Created ${DEMO_SERVICES.length} starter service categories.`);
  } else {
    console.log("Services already exist — skipping.");
  }

  // --- Demo news ---
  const newsCount = await NewsArticle.countDocuments();
  if (newsCount === 0) {
    await NewsArticle.insertMany(DEMO_NEWS.map((n) => ({ ...n, publishedAt: new Date() })));
    console.log(`Created ${DEMO_NEWS.length} demo news articles (marked isDemo).`);
  } else {
    console.log("News articles already exist — skipping.");
  }

  console.log("\nSeed complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
