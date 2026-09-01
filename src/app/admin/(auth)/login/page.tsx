import { Suspense } from "react";
import { LogoMark } from "@/components/site/LogoMark";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Admin Sign In | Swashray Immigration Services Inc." };

export default function AdminLoginPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <LogoMark className="h-10 w-10 mb-3" />
        <h1 className="font-heading text-xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to manage the Swashray Immigration website.</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
