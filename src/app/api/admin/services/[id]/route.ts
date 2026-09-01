import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import { serviceSchema } from "@/lib/validation";
import { toSlug, serialize } from "@/lib/utils";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  await connectDB();
  const service = await Service.findById(id).lean();
  if (!service) return errorResponse("Service not found.", 404);
  return NextResponse.json({ service: serialize(service) });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let slug = toSlug(parsed.data.slug || parsed.data.title);
  const existing = await Service.findOne({ slug, _id: { $ne: id } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const service = await Service.findByIdAndUpdate(id, { ...parsed.data, slug }, { returnDocument: "after" });
  if (!service) return errorResponse("Service not found.", 404);
  return NextResponse.json({ service: serialize(service.toObject()) });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  await connectDB();
  await Service.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
