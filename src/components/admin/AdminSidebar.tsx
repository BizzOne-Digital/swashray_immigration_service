"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Newspaper,
  CalendarClock,
  MessageSquare,
  Image as ImageIcon,
  Palette,
  Settings,
  Search,
  Compass,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/site/LogoMark";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content", label: "Website Content", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/news", label: "News & Updates", icon: Newspaper },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/theme", label: "Theme", icon: Palette },
  { href: "/admin/navigation", label: "Navigation", icon: Compass },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/account", label: "Admin Account", icon: UserCircle },
];

export function AdminSidebar({
  pendingBookings,
  newInquiries,
}: {
  pendingBookings: number;
  newInquiries: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
        <LogoMark className="h-7 w-7" />
        <div>
          <p className="text-sm font-semibold text-slate-900 leading-none">Swashray</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Admin Dashboard</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const badge =
            item.href === "/admin/bookings" ? pendingBookings : item.href === "/admin/inquiries" ? newInquiries : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-semibold rounded-full px-1.5 py-0.5",
                    active ? "bg-white/20 text-white" : "bg-slate-900 text-white"
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <Link href="/" target="_blank" className="text-xs text-slate-400 hover:text-slate-700">
          View Public Website →
        </Link>
      </div>
    </aside>
  );
}
