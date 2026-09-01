import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import { serviceSchema } from "@/lib/validation";
import { toSlug, serialize } from "@/lib/utils";

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  await connectDB();
  const services = await Service.find().sort({ order: 1 }).lean();
  return NextResponse.json({ services: serialize(services) });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let slug = toSlug(parsed.data.slug || parsed.data.title);
  const existing = await Service.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const service = await Service.create({ ...parsed.data, slug });
  return NextResponse.json({ service: serialize(service.toObject()) });
}
