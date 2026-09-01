import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import { serialize } from "@/lib/utils";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata = { title: "Edit Service | Admin" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const service = await Service.findById(id).lean();
  if (!service) notFound();
  const initial = serialize(service);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Edit Service</h1>
        <p className="text-sm text-slate-500 mt-1">{initial.title}</p>
      </div>
      <ServiceForm
        initial={{
          _id: initial._id,
          title: initial.title,
          slug: initial.slug,
          shortDescription: initial.shortDescription,
          description: initial.description,
          whoItsFor: initial.whoItsFor,
          process: initial.process,
          icon: initial.icon,
          ctaText: initial.ctaText,
          ctaUrl: initial.ctaUrl,
          order: initial.order,
          active: initial.active,
          featuredImageMediaId: initial.featuredImageMediaId,
          faq: initial.faq || [],
          seo: initial.seo || { title: "", description: "" },
        }}
      />
    </div>
  );
}
