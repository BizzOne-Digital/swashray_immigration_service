import { connectDB } from "@/lib/db";
import HomeContent, { IHomeContent } from "@/lib/models/HomeContent";
import AboutContent, { IAboutContent } from "@/lib/models/AboutContent";
import SiteSettings, { ISiteSettings } from "@/lib/models/SiteSettings";
import ThemeSettings, { IThemeSettings } from "@/lib/models/ThemeSettings";
import BookingSettings, { IBookingSettings } from "@/lib/models/BookingSettings";
import NavigationItem from "@/lib/models/NavigationItem";
import { serialize } from "@/lib/utils";

/** Generic "get the one settings/content doc, creating it with defaults if missing" helper. */
async function getSingleton<T>(Model: { findOne: () => any; create: (v: object) => any }): Promise<T> {
  await connectDB();
  let doc = await Model.findOne();
  if (!doc) {
    doc = await Model.create({});
  }
  return serialize(doc.toObject());
}

export const getHomeContent = () => getSingleton<IHomeContent>(HomeContent);
export const getAboutContent = () => getSingleton<IAboutContent>(AboutContent);
export const getSiteSettings = () => getSingleton<ISiteSettings>(SiteSettings);
export const getThemeSettings = () => getSingleton<IThemeSettings>(ThemeSettings);
export const getBookingSettings = () => getSingleton<IBookingSettings>(BookingSettings);

// The "/services" item renders as the "Our Services" dropdown (every service
// category), and the header adds its own "Calculators" dropdown right after
// it; booking is reached through the header's "Book a Consultation" button.
const DEFAULT_NAV = [
  { label: "Home", url: "/", order: 0, visible: true, openInNewTab: false },
  { label: "About Us", url: "/about", order: 1, visible: true, openInNewTab: false },
  { label: "Our Services", url: "/services", order: 2, visible: true, openInNewTab: false },
  { label: "Blog", url: "/news", order: 3, visible: true, openInNewTab: false },
  { label: "Contact Us", url: "/contact", order: 4, visible: true, openInNewTab: false },
];

export async function getNavigation() {
  await connectDB();
  const count = await NavigationItem.countDocuments();
  if (count === 0) {
    await NavigationItem.insertMany(DEFAULT_NAV);
  }
  const items = await NavigationItem.find({ visible: true }).sort({ order: 1 });
  return serialize(items.map((i) => i.toObject()));
}
