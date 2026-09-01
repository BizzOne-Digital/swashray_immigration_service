import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import BookingSettings from "@/lib/models/BookingSettings";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  workingDays: z.array(z.number().int().min(0).max(6)),
  openTime: z.string(),
  closeTime: z.string(),
  appointmentDurationMinutes: z.coerce.number().int().min(5).max(480),
  bufferMinutes: z.coerce.number().int().min(0).max(240),
  closedDates: z.array(z.string()),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  await connectDB();
  let settings = await BookingSettings.findOne();
  if (!settings) settings = await BookingSettings.create({});
  return NextResponse.json({ settings: serialize(settings.toObject()) });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let settings = await BookingSettings.findOne();
  if (!settings) settings = new BookingSettings({});
  settings.set(parsed.data);
  await settings.save();

  return NextResponse.json({ settings: serialize(settings.toObject()) });
}
