import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import SiteSettings from "@/lib/models/SiteSettings";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const settingsSchema = z.object({
  businessName: z.string().min(1).max(200),
  contactPerson: z.string().max(120).optional().default(""),
  phone: z.string().min(1).max(40),
  email: z.string().email(),
  address: z.string().max(300).optional().default(""),
  businessDescription: z.string().max(2000).optional().default(""),
  social: z.object({
    facebook: z.string().max(300).optional().default(""),
    instagram: z.string().max(300).optional().default(""),
    linkedin: z.string().max(300).optional().default(""),
    x: z.string().max(300).optional().default(""),
    youtube: z.string().max(300).optional().default(""),
  }),
  logoMediaId: z.string().nullable().optional(),
  faviconMediaId: z.string().nullable().optional(),
  footerDescription: z.string().max(1000).optional().default(""),
  copyrightText: z.string().max(300).optional().default(""),
  disclaimerText: z.string().max(4000).optional().default(""),
  seoDefaults: z.object({
    title: z.string().max(200).optional().default(""),
    description: z.string().max(400).optional().default(""),
    keywords: z.string().max(400).optional().default(""),
    ogImageMediaId: z.string().nullable().optional(),
  }),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  await connectDB();
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  return NextResponse.json({ settings: serialize(settings.toObject()) });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let settings = await SiteSettings.findOne();
  if (!settings) settings = new SiteSettings({});
  settings.set(parsed.data);
  await settings.save();

  return NextResponse.json({ settings: serialize(settings.toObject()) });
}
