"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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

export function AdminMobileNav({ pendingBookings, newInquiries }: { pendingBookings: number; newInquiries: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 -ml-2 text-slate-700">
        <Menu className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <div className="h-full w-72 bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-slate-900">Menu</p>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const badge =
                  item.href === "/admin/bookings" ? pendingBookings : item.href === "/admin/inquiries" ? newInquiries : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    <item.icon className="h-4.5 w-4.5" />
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 bg-slate-900 text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
