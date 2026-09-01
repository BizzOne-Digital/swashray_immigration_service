import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import HomeContent from "@/lib/models/HomeContent";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const homeSchema = z.object({
  heroHeadline: z.string().min(1).max(200),
  heroSubheading: z.string().max(1000).optional().default(""),
  heroImageMediaId: z.string().nullable().optional(),
  primaryCtaText: z.string().max(60).optional().default(""),
  primaryCtaUrl: z.string().max(300).optional().default(""),
  secondaryCtaText: z.string().max(60).optional().default(""),
  secondaryCtaUrl: z.string().max(300).optional().default(""),
  servicesHeading: z.string().max(200).optional().default(""),
  servicesIntro: z.string().max(500).optional().default(""),
  whyChooseHeading: z.string().max(200).optional().default(""),
  whyChooseIntro: z.string().max(500).optional().default(""),
  benefits: z.array(z.object({ title: z.string(), text: z.string(), icon: z.string() })).max(8).optional().default([]),
  journeyHeading: z.string().max(200).optional().default(""),
  journeyIntro: z.string().max(500).optional().default(""),
  journeySteps: z.array(z.object({ title: z.string(), text: z.string() })).max(8).optional().default([]),
  newsHeading: z.string().max(200).optional().default(""),
  newsIntro: z.string().max(500).optional().default(""),
  ctaHeading: z.string().max(200).optional().default(""),
  ctaText: z.string().max(500).optional().default(""),
  ctaPrimaryText: z.string().max(60).optional().default(""),
  ctaPrimaryUrl: z.string().max(300).optional().default(""),
  ctaSecondaryText: z.string().max(60).optional().default(""),
  ctaSecondaryUrl: z.string().max(300).optional().default(""),
  seo: z.object({ title: z.string().max(200).optional().default(""), description: z.string().max(400).optional().default("") }),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  await connectDB();
  let content = await HomeContent.findOne();
  if (!content) content = await HomeContent.create({});
  return NextResponse.json({ content: serialize(content.toObject()) });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = homeSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let content = await HomeContent.findOne();
  if (!content) content = new HomeContent({});
  content.set(parsed.data);
  await content.save();

  return NextResponse.json({ content: serialize(content.toObject()) });
}
