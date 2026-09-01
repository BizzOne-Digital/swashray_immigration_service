import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Media from "@/lib/models/Media";
import { openDownloadStream } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
  }

  await connectDB();
  const media = await Media.findById(id);
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const downloadStream = await openDownloadStream(media.gridFsId);

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    downloadStream.on("data", (chunk) => chunks.push(chunk as Buffer));
    downloadStream.on("end", () => resolve());
    downloadStream.on("error", reject);
  });

  const body = new Uint8Array(Buffer.concat(chunks));

  return new NextResponse(body, {
    headers: {
      "Content-Type": media.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(media.size),
    },
  });
}
