"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquareHeart,
  FileText,
  Settings,
  Bell,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import RoleGuard from "@/components/RoleGuard";
import { useRole } from "@/lib/role-context";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "ダッシュボード", href: "/doctor/dashboard", icon: LayoutDashboard, badge: 0 },
  { label: "患者一覧", href: "/doctor/patients", icon: Users, badge: 0 },
  { label: "スケジュール", href: "/doctor/schedule", icon: Calendar, badge: 8 },
  { label: "AI問診確認", href: "/doctor/consultations", icon: MessageSquareHeart, badge: 3 },
  { label: "処方管理", href: "/doctor/prescriptions", icon: FileText, badge: 2 },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clearRole } = useRole();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        await supabase.auth.signOut({ scope: "local" });
      }
    } catch {
      // ignore and continue local cleanup
    } finally {
      clearRole();
      window.location.replace("/auth/login?logout=1");
    }
  }

  return (
    <RoleGuard allowed={["doctor"]}>
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b h-16 flex items-center px-4 lg:px-6">
        <button className="lg:hidden p-2 -ml-2 mr-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/doctor/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg">
            Medixus<span className="text-teal-600">OS</span>
          </span>
          <Badge variant="outline" className="text-teal-700 border-teal-300 text-xs">医師</Badge>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 p-2">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-teal-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium">佐藤 一郎 先生</span>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r z-40 transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {item.badge > 0 && (
                  <span className="ml-auto w-5 h-5 bg-teal-600 text-white rounded-full text-[10px] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">
            <Settings size={18} /> 設定
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut size={18} /> {loggingOut ? "ログアウト中..." : "ログアウト"}
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
    </RoleGuard>
  );
}
