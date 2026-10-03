import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Readable } from "stream";
import { connectDB } from "@/lib/db";
import Media from "@/lib/models/Media";
import { openDownloadStream } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
  }

  await connectDB();
  const media = await Media.findById(id);
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isVideo = media.mimeType.startsWith("video/");

  // Video: stream, and honor Range requests (required for smooth/seekable
  // playback and for autoplay to work reliably on iOS Safari). Small clips
  // only (see MAX_VIDEO_UPLOAD_BYTES), so this is never a huge transfer.
  if (isVideo) {
    const fileSize = media.size;
    const range = req.headers.get("range");

    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      const start = match ? parseInt(match[1], 10) : 0;
      const end = match && match[2] ? Math.min(parseInt(match[2], 10), fileSize - 1) : fileSize - 1;
      if (Number.isNaN(start) || start >= fileSize) {
        return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${fileSize}` } });
      }
      const downloadStream = await openDownloadStream(media.gridFsId, { start, end: end + 1 });
      const webStream = Readable.toWeb(downloadStream) as unknown as ReadableStream;
      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Type": media.mimeType,
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(end - start + 1),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const downloadStream = await openDownloadStream(media.gridFsId);
    const webStream = Readable.toWeb(downloadStream) as unknown as ReadableStream;
    return new NextResponse(webStream, {
      headers: {
        "Content-Type": media.mimeType,
        "Accept-Ranges": "bytes",
        "Content-Length": String(fileSize),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Images: unchanged — small enough to buffer fully.
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
