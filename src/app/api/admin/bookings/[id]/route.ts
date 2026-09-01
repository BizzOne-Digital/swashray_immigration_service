import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Booking, { BOOKING_STATUSES } from "@/lib/models/Booking";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  adminNotes: z.string().max(4000).optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
});

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await ctx.params;
  await connectDB();
  const booking = await Booking.findById(id).lean();
  if (!booking) return errorResponse("Booking not found.", 404);
  return NextResponse.json({ booking: serialize(booking) });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  const booking = await Booking.findByIdAndUpdate(id, parsed.data, { returnDocument: "after" });
  if (!booking) return errorResponse("Booking not found.", 404);
  return NextResponse.json({ booking: serialize(booking.toObject()) });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await ctx.params;
  await connectDB();
  await Booking.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
