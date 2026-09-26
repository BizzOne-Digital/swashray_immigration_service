import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";

/**
 * Bulk-updates the `order` field for a set of services in one request, so
 * the admin drag-and-drop reorder UI can persist a new order without a
 * round trip per row. Body: { order: string[] } — an array of service _ids
 * in the desired display order (index 0 gets order 0, and so on).
 *
 * This order directly drives both the /services grid and the site's
 * "Programs" navigation dropdown, so keeping this fast and reliable matters
 * for the admin experience.
 *
 * Uses Model.updateOne($set) rather than load-mutate-.save(), matching the
 * project's established Mongoose pattern for strict:false schemas.
 */
export async function PATCH(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const order: unknown = body?.order;
  if (!Array.isArray(order) || order.some((id) => typeof id !== "string")) {
    return errorResponse("Expected { order: string[] } — an array of service ids.");
  }

  await connectDB();
  await Promise.all(
    order.map((id, index) => Service.updateOne({ _id: id }, { $set: { order: index } }))
  );

  const services = await Service.find().sort({ order: 1 }).lean();
  return NextResponse.json({ ok: true, services: services.map((s: any) => ({ _id: String(s._id), order: s.order })) });
}
