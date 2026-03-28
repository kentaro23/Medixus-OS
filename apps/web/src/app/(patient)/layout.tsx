"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  LayoutDashboard,
  MessageSquareHeart,
  Calendar,
  Pill,
  HeartPulse,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RoleGuard from "@/components/RoleGuard";
import { useRole } from "@/lib/role-context";

const navItems = [
  { label: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI問診", href: "/triage", icon: MessageSquareHeart },
  { label: "予約", href: "/appointments", icon: Calendar },
  { label: "処方箋", href: "/prescriptions", icon: Pill },
  { label: "服薬管理", href: "/medications", icon: Pill },
  { label: "健康データ", href: "/health", icon: HeartPulse },
  { label: "メッセージ", href: "/messages", icon: Bell },
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clearRole } = useRole();

  return (
    <RoleGuard allowed={["patient"]}>
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b h-16 flex items-center px-4 lg:px-6">
        <button
          className="lg:hidden p-2 -ml-2 mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg">
            Medixus<span className="text-indigo-600">OS</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-indigo-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium">山田 太郎</span>
          </Link>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r z-40 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Link href="/clinic/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">
            <User size={18} /> プロフィール設定
          </Link>
          <button
            onClick={() => { clearRole(); window.location.href = "/"; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut size={18} /> ログアウト
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
