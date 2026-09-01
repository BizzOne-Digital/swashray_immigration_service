import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import { toSlug, serialize } from "@/lib/utils";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  await connectDB();
  const original = await Service.findById(id).lean();
  if (!original) return errorResponse("Service not found.", 404);

  const copy = { ...original } as Record<string, unknown>;
  delete copy._id;
  delete copy.createdAt;
  delete copy.updatedAt;
  copy.title = `${(original as any).title} (Copy)`;
  copy.slug = toSlug(`${(original as any).slug}-copy-${Date.now().toString(36)}`);
  copy.active = false;

  const created = await Service.create(copy);
  return NextResponse.json({ service: serialize(created.toObject()) });
}
