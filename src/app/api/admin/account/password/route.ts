import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import AdminUser from "@/lib/models/AdminUser";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  const user = await AdminUser.findById(session.sub);
  if (!user) return errorResponse("User not found.", 404);

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return errorResponse("Current password is incorrect.", 401);

  user.passwordHash = await hashPassword(parsed.data.newPassword);
  await user.save();

  return NextResponse.json({ ok: true });
}
