import Link from "next/link";
import { Briefcase, Newspaper, CalendarClock, MessageSquare, Image as ImageIcon, ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import Service from "@/lib/models/Service";
import NewsArticle from "@/lib/models/NewsArticle";
import Booking from "@/lib/models/Booking";
import Inquiry from "@/lib/models/Inquiry";
import Media from "@/lib/models/Media";
import { serialize, formatDate } from "@/lib/utils";
import { cardClass } from "@/lib/adminUi";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Dashboard | Admin" };

export default async function AdminDashboardPage() {
  await connectDB();

  const [totalServices, publishedNews, pendingBookings, newInquiries, totalMedia, recentInquiries, upcomingBookings, recentNews] =
    await Promise.all([
      Service.countDocuments({ active: true }),
      NewsArticle.countDocuments({ status: "published" }),
      Booking.countDocuments({ status: "Pending" }),
      Inquiry.countDocuments({ status: "New" }),
      Media.countDocuments({}),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
      Booking.find({ status: { $in: ["Pending", "Confirmed"] } }).sort({ preferredDate: 1 }).limit(5).lean(),
      NewsArticle.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  const cards = [
    { label: "Total Services", value: totalServices, icon: Briefcase, href: "/admin/services" },
    { label: "Published News", value: publishedNews, icon: Newspaper, href: "/admin/news" },
    { label: "Pending Bookings", value: pendingBookings, icon: CalendarClock, href: "/admin/bookings" },
    { label: "New Inquiries", value: newInquiries, icon: MessageSquare, href: "/admin/inquiries" },
    { label: "Total Media", value: totalMedia, icon: ImageIcon, href: "/admin/media" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">An overview of your website&apos;s activity.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`${cardClass} p-5 hover:shadow-md transition-shadow`}>
            <c.icon className="h-5 w-5 text-slate-400 mb-3" />
            <p className="text-2xl font-semibold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-slate-400">No inquiries yet.</p>
          ) : (
            <ul className="space-y-3">
              {serialize(recentInquiries).map((i: any) => (
                <li key={i._id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{i.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{formatDate(i.createdAt)}</p>
                  </div>
                  <StatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Upcoming Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming bookings.</p>
          ) : (
            <ul className="space-y-3">
              {serialize(upcomingBookings).map((b: any) => (
                <li key={b._id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{b.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{b.preferredDate} at {b.preferredTime}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent News</h2>
            <Link href="/admin/news" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentNews.length === 0 ? (
            <p className="text-sm text-slate-400">No news articles yet.</p>
          ) : (
            <ul className="space-y-3">
              {serialize(recentNews).map((n: any) => (
                <li key={n._id} className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                  <StatusBadge status={n.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
