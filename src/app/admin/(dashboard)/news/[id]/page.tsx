import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import NewsArticle from "@/lib/models/NewsArticle";
import { serialize } from "@/lib/utils";
import { NewsForm } from "@/components/admin/NewsForm";

export const metadata = { title: "Edit Article | Admin" };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const article = await NewsArticle.findById(id).lean();
  if (!article) notFound();
  const initial = serialize(article);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Edit Article</h1>
        <p className="text-sm text-slate-500 mt-1">{initial.title}</p>
      </div>
      <NewsForm
        initial={{
          _id: initial._id,
          title: initial.title,
          slug: initial.slug,
          excerpt: initial.excerpt,
          content: initial.content,
          category: initial.category,
          tags: initial.tags || [],
          author: initial.author,
          status: initial.status,
          featured: initial.featured,
          isDemo: initial.isDemo,
          featuredImageMediaId: initial.featuredImageMediaId,
          seo: initial.seo || { title: "", description: "" },
        }}
      />
    </div>
  );
}
