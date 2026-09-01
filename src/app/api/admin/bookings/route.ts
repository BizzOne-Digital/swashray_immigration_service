import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { serialize } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  await connectDB();
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const date = searchParams.get("date");
  const q = searchParams.get("q");

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (date) filter.preferredDate = date;
  if (q) {
    filter.$or = [
      { fullName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }

  const bookings = await Booking.find(filter).sort({ preferredDate: 1, preferredTime: 1 }).lean();
  return NextResponse.json({ bookings: serialize(bookings) });
}
