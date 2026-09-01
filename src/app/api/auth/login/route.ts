import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminUser from "@/lib/models/AdminUser";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { isRateLimited } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (await isRateLimited("login", ip, 10)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  await connectDB();
  const user = await AdminUser.findOne({ email: parsed.data.email.toLowerCase().trim() });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken({ sub: user._id.toString(), email: user.email, name: user.name });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, name: user.name, email: user.email });
}
