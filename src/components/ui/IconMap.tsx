import {
  UserCheck,
  MessageCircle,
  ShieldCheck,
  Handshake,
  FileCheck,
  Plane,
  Users,
  Briefcase,
  GraduationCap,
  BookOpen,
  Compass,
  Globe2,
  ClipboardList,
  Stamp,
  Award,
  Scale,
  Clock,
  Mail,
  Phone,
  MapPin,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  UserCheck,
  MessageCircle,
  ShieldCheck,
  Handshake,
  FileCheck,
  Plane,
  Users,
  Briefcase,
  GraduationCap,
  BookOpen,
  Compass,
  Globe2,
  ClipboardList,
  Stamp,
  Award,
  Scale,
  Clock,
  Mail,
  Phone,
  MapPin,
  Newspaper,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] || FileCheck;
  return <Cmp className={className} aria-hidden="true" />;
}
