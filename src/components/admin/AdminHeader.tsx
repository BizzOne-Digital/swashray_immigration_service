"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export function AdminHeader({ name, pendingBookings, newInquiries }: { name: string; pendingBookings: number; newInquiries: number }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out.");
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-5 lg:px-8">
      <AdminMobileNav pendingBookings={pendingBookings} newInquiries={newInquiries} />
      <div className="hidden lg:block text-sm text-slate-500">
        Welcome back, <span className="font-medium text-slate-900">{name}</span>
      </div>
      <button
        onClick={logout}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </header>
  );
}
