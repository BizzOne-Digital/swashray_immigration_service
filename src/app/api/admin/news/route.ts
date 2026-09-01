import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import NewsArticle from "@/lib/models/NewsArticle";
import { newsArticleSchema } from "@/lib/validation";
import { toSlug, serialize } from "@/lib/utils";

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  await connectDB();
  const articles = await NewsArticle.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ articles: serialize(articles) });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => null);
  const parsed = newsArticleSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let slug = toSlug(parsed.data.slug || parsed.data.title);
  const existing = await NewsArticle.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const publishedAt = parsed.data.status === "published" ? new Date() : null;

  const article = await NewsArticle.create({ ...parsed.data, slug, publishedAt });
  return NextResponse.json({ article: serialize(article.toObject()) });
}
