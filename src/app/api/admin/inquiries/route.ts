import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Inquiry from "@/lib/models/Inquiry";
import { serialize } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  await connectDB();
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { fullName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ inquiries: serialize(inquiries) });
}
