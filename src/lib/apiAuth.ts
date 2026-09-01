import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

/**
 * Guard for admin-only API route handlers.
 * Returns the session payload, or a 401 NextResponse to return immediately.
 *
 * Usage:
 *   const session = await requireAdminApi();
 *   if (session instanceof NextResponse) return session;
 */
export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }
  return session;
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
