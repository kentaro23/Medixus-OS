"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={["medixus_admin"]}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
