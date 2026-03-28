"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  User,
  Building2,
  Shield,
  ArrowRight,
  Heart,
  Activity,
  Brain,
} from "lucide-react";
import { useRole, type AppRole } from "@/lib/role-context";

const roles: {
  id: AppRole;
  label: string;
  description: string;
  icon: typeof User;
  color: string;
  bgGradient: string;
  href: string;
}[] = [
  {
    id: "patient",
    label: "患者",
    description: "AI問診・予約・服薬管理・健康データの確認",
    icon: User,
    color: "text-indigo-600",
    bgGradient: "from-indigo-500 to-purple-600",
    href: "/dashboard",
  },
  {
    id: "doctor",
    label: "医師",
    description: "診察・AI問診確認・処方管理・患者サマリー",
    icon: Stethoscope,
    color: "text-teal-600",
    bgGradient: "from-teal-500 to-emerald-600",
    href: "/doctor/dashboard",
  },
  {
    id: "clinic_admin",
    label: "クリニック管理者",
    description: "SaaSモジュール操作・スタッフ管理・患者管理",
    icon: Building2,
    color: "text-cyan-600",
    bgGradient: "from-cyan-500 to-blue-600",
    href: "/clinic",
  },
  {
    id: "admin",
    label: "Medixus運営管理者",
    description: "KPI管理・クリニック管理・収益分析・システム設定",
    icon: Shield,
    color: "text-slate-600",
    bgGradient: "from-slate-600 to-slate-800",
    href: "/admin",
  },
];

export default function PortalPage() {
  const { role, setRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role) {
      const target = roles.find((r) => r.id === role);
      if (target) {
        router.replace(target.href);
      }
    }
  }, [role, router]);

  function handleSelect(r: AppRole) {
    const target = roles.find((x) => x.id === r);
    if (target) {
      setRole(r);
      router.push(target.href);
    }
  }

  if (role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Stethoscope size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Medixus<span className="text-indigo-600">OS</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            「具合が悪くなってから受診する」を終わらせる
            <br />
            AI×オンライン診療×予防医療プラットフォーム
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 text-left hover:shadow-xl hover:border-gray-300 transition-all duration-200 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${r.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.bgGradient} flex items-center justify-center shadow-lg`}>
                  <r.icon size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">{r.label}</h2>
                    <ArrowRight
                      size={18}
                      className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
          {[
            { icon: Brain, label: "AI問診", desc: "症状→トリアージ→診察" },
            { icon: Activity, label: "遠隔モニタリング", desc: "バイタル常時監視" },
            { icon: Heart, label: "予防医療", desc: "治療中断率を0%に" },
          ].map((f) => (
            <div key={f.label} className="space-y-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto">
                <f.icon size={20} className="text-indigo-500" />
              </div>
              <p className="font-semibold text-sm">{f.label}</p>
              <p className="text-xs text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-12">
          © {new Date().getFullYear()} Medixus株式会社 | 開発モード — Supabase接続後は認証に基づいてロールが自動判定されます
        </p>
      </div>
    </div>
  );
}
