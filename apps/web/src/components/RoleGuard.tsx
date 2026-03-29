"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldX, ArrowLeft } from "lucide-react";
import { useRole, type AppRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";

const ROLE_LABELS: Record<string, string> = {
  patient: "患者",
  doctor: "医師",
  nurse: "看護師",
  clerk: "事務",
  clinic_admin: "クリニック管理者",
  medixus_admin: "Medixus運営管理者",
};

interface RoleGuardProps {
  allowed: AppRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { role, loading } = useRole();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!role) {
      router.replace("/");
    }
  }, [mounted, loading, role, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!allowed.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldX size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">アクセス権限がありません</h1>
          <p className="text-gray-500">
            このページは
            <span className="font-medium text-gray-700">
              {allowed.map((a) => ROLE_LABELS[a] || a).join("・")}
            </span>
            のみアクセスできます。
          </p>
          <p className="text-sm text-gray-400">
            現在のロール: <span className="font-medium">{ROLE_LABELS[role] || role}</span>
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            ポータルに戻る
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
