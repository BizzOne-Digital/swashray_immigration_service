import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, errorResponse } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import NewsArticle from "@/lib/models/NewsArticle";
import { newsArticleSchema } from "@/lib/validation";
import { toSlug, serialize } from "@/lib/utils";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  await connectDB();
  const article = await NewsArticle.findById(id).lean();
  if (!article) return errorResponse("Article not found.", 404);
  return NextResponse.json({ article: serialize(article) });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = newsArticleSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Invalid data.");

  await connectDB();
  let slug = toSlug(parsed.data.slug || parsed.data.title);
  const existing = await NewsArticle.findOne({ slug, _id: { $ne: id } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const current = await NewsArticle.findById(id);
  if (!current) return errorResponse("Article not found.", 404);

  const publishedAt =
    parsed.data.status === "published" ? current.publishedAt || new Date() : current.status === "published" ? current.publishedAt : null;

  const article = await NewsArticle.findByIdAndUpdate(id, { ...parsed.data, slug, publishedAt }, { returnDocument: "after" });
  return NextResponse.json({ article: serialize(article!.toObject()) });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await ctx.params;
  await connectDB();
  await NewsArticle.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
