import { NewsForm } from "@/components/admin/NewsForm";

export const metadata = { title: "Add Article | Admin" };

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Add Article</h1>
        <p className="text-sm text-slate-500 mt-1">Create a news or update article.</p>
      </div>
      <NewsForm />
    </div>
  );
}
