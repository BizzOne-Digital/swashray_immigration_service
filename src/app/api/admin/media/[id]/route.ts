import { NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { deleteMedia } from "@/lib/media";
import { connectDB } from "@/lib/db";
import Media from "@/lib/models/Media";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  await connectDB();
  const media = await Media.findById(id);
  if (!media) return errorResponse("Media not found.", 404);

  await deleteMedia(id);
  return NextResponse.json({ ok: true });
}
