import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inquiry from "@/lib/models/Inquiry";
import { inquirySchema } from "@/lib/validation";
import { isRateLimited } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (await isRateLimited("inquiry", ip, 8)) {
    return NextResponse.json(
      { error: "Too many submissions from this connection. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission." }, { status: 400 });
  }

  // Honeypot triggered — pretend success so bots don't learn anything, but don't save.
  if (parsed.data.companyWebsite) {
    return NextResponse.json({ ok: true });
  }

  await connectDB();
  await Inquiry.create({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    serviceOfInterest: parsed.data.serviceOfInterest,
    message: parsed.data.message,
    preferredContactMethod: parsed.data.preferredContactMethod,
  });

  return NextResponse.json({ ok: true });
}
