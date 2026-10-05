import { connectDB } from "@/lib/db";
import HomeContent, { IHomeContent } from "@/lib/models/HomeContent";
import AboutContent, { IAboutContent } from "@/lib/models/AboutContent";
import SiteSettings, { ISiteSettings } from "@/lib/models/SiteSettings";
import ThemeSettings, { IThemeSettings } from "@/lib/models/ThemeSettings";
import BookingSettings, { IBookingSettings } from "@/lib/models/BookingSettings";
import NavigationItem from "@/lib/models/NavigationItem";
import Service from "@/lib/models/Service";
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

const DEFAULT_NAV = [
  { label: "Home", url: "/", order: 0, visible: true, openInNewTab: false },
  { label: "About Us", url: "/about", order: 1, visible: true, openInNewTab: false },
  { label: "Services", url: "/services", order: 2, visible: true, openInNewTab: false },
  { label: "Calculators", url: "/calculators", order: 3, visible: true, openInNewTab: false },
  { label: "News", url: "/news", order: 4, visible: true, openInNewTab: false },
  { label: "Booking", url: "/booking", order: 5, visible: true, openInNewTab: false },
  { label: "Contact", url: "/contact", order: 6, visible: true, openInNewTab: false },
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

/**
 * Minimal, ordered list of active services for the header/mobile "Programs"
 * dropdown — just enough fields to render a link with an icon.
 */
export async function getActiveServices() {
  await connectDB();
  const items = await Service.find({ active: true })
    .select("title slug icon")
    .sort({ order: 1 })
    .lean();
  return serialize(items);
}
