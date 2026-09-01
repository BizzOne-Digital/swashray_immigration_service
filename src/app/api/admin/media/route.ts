import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Media from "@/lib/models/Media";
import { uploadMedia, MediaUploadError } from "@/lib/media";
import { serialize } from "@/lib/utils";

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  await connectDB();
  const media = await Media.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ media: serialize(media) });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const formData = await req.formData();
  const file = formData.get("file");
  const altText = (formData.get("altText") as string) || "";

  if (!(file instanceof File)) {
    return errorResponse("No file provided.");
  }

  try {
    const media = await uploadMedia(file, altText);
    return NextResponse.json({ media: serialize(media.toObject()) });
  } catch (err) {
    if (err instanceof MediaUploadError) return errorResponse(err.message);
    console.error("Media upload failed", err);
    return errorResponse("Upload failed. Please try again.", 500);
  }
}
