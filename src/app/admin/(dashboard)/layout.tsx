import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Inquiry from "@/lib/models/Inquiry";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  await connectDB();
  const [pendingBookings, newInquiries] = await Promise.all([
    Booking.countDocuments({ status: "Pending" }),
    Inquiry.countDocuments({ status: "New" }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar pendingBookings={pendingBookings} newInquiries={newInquiries} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader name={session.name} pendingBookings={pendingBookings} newInquiries={newInquiries} />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
