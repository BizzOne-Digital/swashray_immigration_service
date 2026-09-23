import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/cms";
import { openDownloadStream } from "@/lib/media";
import { connectDB } from "@/lib/db";
import Media from "@/lib/models/Media";
import mongoose from "mongoose";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Icon() {
  try {
    const settings = await getSiteSettings();
    const faviconId = settings.faviconMediaId || settings.logoMediaId;
    if (faviconId) {
      // faviconId/logoMediaId reference a Media document (see the Service/
      // Footer/Header usage of the same fields) — its `gridFsId` field is
      // the actual GridFS file id, which is what openDownloadStream needs.
      await connectDB();
      const media = await Media.findById(String(faviconId));
      if (!media) throw new Error("Favicon media document not found");
      const stream = await openDownloadStream(new mongoose.Types.ObjectId(String(media.gridFsId)));
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on("data", (c) => chunks.push(c as Buffer));
        stream.on("end", () => resolve());
        stream.on("error", reject);
      });
      return new Response(new Uint8Array(Buffer.concat(chunks)), {
        headers: { "Content-Type": "image/png" },
      });
    }
  } catch {
    // fall through to generated default mark below
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d3d3d",
          borderRadius: 6,
        }}
      >
        <span style={{ color: "#c8a24a", fontSize: 20, fontWeight: 700, fontFamily: "Georgia, serif" }}>S</span>
      </div>
    ),
    { ...size }
  );
}
