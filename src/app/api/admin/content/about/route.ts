import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import AboutContent from "@/lib/models/AboutContent";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const aboutSchema = z.object({
  introHeading: z.string().min(1).max(200),
  introText: z.string().max(4000).optional().default(""),
  introImageMediaId: z.string().nullable().optional(),
  missionHeading: z.string().max(200).optional().default(""),
  missionText: z.string().max(2000).optional().default(""),
  approachHeading: z.string().max(200).optional().default(""),
  approachText: z.string().max(2000).optional().default(""),
  approachImageMediaId: z.string().nullable().optional(),
  whyChooseHeading: z.string().max(200).optional().default(""),
  whyChooseText: z.string().max(2000).optional().default(""),
  ctaHeading: z.string().max(200).optional().default(""),
  ctaText: z.string().max(500).optional().default(""),
  ctaButtonText: z.string().max(60).optional().default(""),
  ctaButtonUrl: z.string().max(300).optional().default(""),
  seo: z.object({ title: z.string().max(200).optional().default(""), description: z.string().max(400).optional().default("") }),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  await connectDB();
  let content = await AboutContent.findOne();
  if (!content) content = await AboutContent.create({});
  return NextResponse.json({ content: serialize(content.toObject()) });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = aboutSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let content = await AboutContent.findOne();
  if (!content) content = new AboutContent({});
  content.set(parsed.data);
  await content.save();

  return NextResponse.json({ content: serialize(content.toObject()) });
}
