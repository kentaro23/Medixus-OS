"use client";

import ClinicSidebar from "@/components/ClinicSidebar";
import { ClinicProvider } from "@/lib/clinic-context";
import { Bell, Search } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={["clinic_admin"]}>
      <ClinicProvider>
        <div className="flex min-h-screen">
          <ClinicSidebar />
          <div className="flex-1 ml-64 flex flex-col min-h-screen">
            <header className="h-14 bg-card-bg border-b border-card-border flex items-center justify-between px-8 sticky top-0 z-20">
              <div className="relative max-w-sm flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="患者ID・氏名で検索..."
                  className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-semibold">
                  クリニックコンソール
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <Bell size={18} className="text-gray-500" />
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                </button>
              </div>
            </header>
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </ClinicProvider>
    </RoleGuard>
  );
}
