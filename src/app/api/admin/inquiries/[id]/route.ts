import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Inquiry, { INQUIRY_STATUSES } from "@/lib/models/Inquiry";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  read: z.boolean().optional(),
  adminNotes: z.string().max(4000).optional(),
});

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  const inquiry = await Inquiry.findByIdAndUpdate(id, parsed.data, { returnDocument: "after" });
  if (!inquiry) return errorResponse("Inquiry not found.", 404);
  return NextResponse.json({ inquiry: serialize(inquiry.toObject()) });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await ctx.params;
  await connectDB();
  await Inquiry.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
