import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata = { title: "Add Service | Admin" };

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Add Service</h1>
        <p className="text-sm text-slate-500 mt-1">Create a new immigration service category.</p>
      </div>
      <ServiceForm />
    </div>
  );
}
