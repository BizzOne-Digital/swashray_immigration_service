import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import NavigationItem from "@/lib/models/NavigationItem";
import { serialize } from "@/lib/utils";
import { z } from "zod";

const itemSchema = z.object({
  _id: z.string().optional(),
  label: z.string().min(1).max(60),
  url: z.string().min(1).max(300),
  order: z.number(),
  visible: z.boolean(),
  openInNewTab: z.boolean(),
});

const bulkSchema = z.object({ items: z.array(itemSchema) });

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  await connectDB();
  const items = await NavigationItem.find().sort({ order: 1 }).lean();
  return NextResponse.json({ items: serialize(items) });
}

// Replaces the full navigation list — simplest reliable way to persist add/remove/reorder together.
export async function PUT(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  await NavigationItem.deleteMany({});
  const created = await NavigationItem.insertMany(
    parsed.data.items.map((item, i) => ({ ...item, order: i }))
  );

  return NextResponse.json({ items: serialize(created.map((c) => c.toObject())) });
}
