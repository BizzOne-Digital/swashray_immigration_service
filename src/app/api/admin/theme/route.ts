import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import ThemeSettings from "@/lib/models/ThemeSettings";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const themeSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    highlight: z.string(),
    dark: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    muted: z.string(),
  }),
  borderRadius: z.enum(["none", "small", "medium", "large"]),
  buttonStyle: z.enum(["solid", "outline", "pill"]),
  headingFont: z.enum(["serif", "sans"]),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  await connectDB();
  let theme = await ThemeSettings.findOne();
  if (!theme) theme = await ThemeSettings.create({});
  return NextResponse.json({ theme: serialize(theme.toObject()) });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = themeSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let theme = await ThemeSettings.findOne();
  if (!theme) theme = new ThemeSettings({});
  theme.set(parsed.data);
  await theme.save();

  return NextResponse.json({ theme: serialize(theme.toObject()) });
}
