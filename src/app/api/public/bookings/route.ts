import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { bookingSchema } from "@/lib/validation";
import { isRateLimited } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/utils";
import { getAvailableSlots } from "@/lib/availability";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (await isRateLimited("booking", ip, 8)) {
    return NextResponse.json(
      { error: "Too many submissions from this connection. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission." }, { status: 400 });
  }

  if (parsed.data.companyWebsite) {
    return NextResponse.json({ ok: true });
  }

  // Re-validate the slot is still available server-side to prevent double-booking
  // from race conditions or a stale client-side slot list.
  const { slots } = await getAvailableSlots(parsed.data.preferredDate);
  if (!slots.includes(parsed.data.preferredTime)) {
    return NextResponse.json(
      { error: "That time slot is no longer available. Please choose another time." },
      { status: 409 }
    );
  }

  await connectDB();
  await Booking.create({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    serviceId: parsed.data.serviceId || null,
    serviceName: parsed.data.serviceName,
    preferredDate: parsed.data.preferredDate,
    preferredTime: parsed.data.preferredTime,
    preferredContactMethod: parsed.data.preferredContactMethod,
    message: parsed.data.message,
  });

  return NextResponse.json({ ok: true });
}
