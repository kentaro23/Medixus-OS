"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope, User, Building2, Shield, ArrowRight,
  Phone, MessageSquare, ClipboardList, CreditCard, Monitor,
  Brain, Video, Activity, Smartphone, Network, ExternalLink,
} from "lucide-react";
import { useRole, type AppRole } from "@/lib/role-context";
import { IS_DEMO } from "@/lib/env";

const DEMO_CLINIC_ID = "c0000001-0000-0000-0000-000000000001";

const SAAS_PRODUCTS = [
  { icon: Brain, label: "AI問診", desc: "症状→トリアージ→診察", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Video, label: "オンライン診療", desc: "予約→ビデオ→処方", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Activity, label: "遠隔モニタリング", desc: "バイタル常時監視", color: "text-red-600", bg: "bg-red-50" },
  { icon: Smartphone, label: "患者アプリ", desc: "服薬・健康管理", color: "text-green-600", bg: "bg-green-50" },
  { icon: Network, label: "提携ネットワーク", desc: "薬局・検査機関連携", color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Phone, label: "AI電話受付", desc: "電話の8割をAI対応", color: "text-indigo-600", bg: "bg-indigo-50" },
  { icon: MessageSquare, label: "LINE予約・呼出", desc: "順番管理+自動通知", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: ClipboardList, label: "Web問診票", desc: "紙の問診票をゼロに", color: "text-teal-600", bg: "bg-teal-50" },
  { icon: CreditCard, label: "自動精算", desc: "クレカ・QR自動精算", color: "text-pink-600", bg: "bg-pink-50" },
  { icon: Monitor, label: "デジタルサイネージ", desc: "待合室モニター", color: "text-cyan-600", bg: "bg-cyan-50" },
];

const roles: { id: AppRole; label: string; description: string; icon: typeof User; bgGradient: string; href: string }[] = [
  { id: "patient", label: "患者", description: "AI問診・予約・服薬管理・健康データの確認", icon: User, bgGradient: "from-indigo-500 to-purple-600", href: "/dashboard" },
  { id: "doctor", label: "医師", description: "診察・AI問診確認・処方管理・患者サマリー", icon: Stethoscope, bgGradient: "from-teal-500 to-emerald-600", href: "/doctor/dashboard" },
  { id: "clinic_admin", label: "クリニック管理者", description: "SaaSモジュール操作・スタッフ管理・患者管理", icon: Building2, bgGradient: "from-cyan-500 to-blue-600", href: "/clinic" },
  { id: "medixus_admin", label: "Medixus運営管理者", description: "KPI管理・クリニック管理・収益分析・システム設定", icon: Shield, bgGradient: "from-slate-600 to-slate-800", href: "/admin" },
];

export default function PortalPage() {
  const { role, setRole } = useRole();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      const target = roles.find((r) => r.id === role);
      if (target) router.replace(target.href);
    }
  }, [role, router]);

  function handleLogin(r: AppRole) {
    setLoading(r);
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

  if (IS_DEMO) {
    return <DemoLanding onLogin={handleLogin} loading={loading} />;
  }

  return <StandardPortal onSelect={handleLogin} />;
}

function DemoLanding({ onLogin, loading }: { onLogin: (r: AppRole) => void; loading: string | null }) {
  const router = useRouter();

  const loginButtons = [
    { role: "clinic_admin" as AppRole, label: "院長としてログイン", desc: "クリニック管理画面", icon: Building2, gradient: "from-cyan-500 to-blue-600" },
    { role: "patient" as AppRole, label: "患者としてログイン", desc: "山田太郎で体験", icon: User, gradient: "from-indigo-500 to-purple-600" },
    { role: "doctor" as AppRole, label: "医師としてログイン", desc: "佐藤誠一先生で体験", icon: Stethoscope, gradient: "from-teal-500 to-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* ヒーロー */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Stethoscope size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Medixus<span className="text-indigo-600">OS</span>
          </h1>
          <p className="text-xl text-gray-600 font-medium mb-2">
            電話・受付・待ち時間・会計・再診を
          </p>
          <p className="text-2xl font-bold text-indigo-700">丸ごとDX化します</p>
        </div>

        {/* ワンクリックログイン */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {loginButtons.map((btn) => (
              <button
                key={btn.role}
                onClick={() => onLogin(btn.role)}
                disabled={loading !== null}
                className="group relative bg-white rounded-2xl border-2 border-gray-200 p-5 text-center hover:border-indigo-400 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${btn.gradient} flex items-center justify-center shadow-lg`}>
                  {loading === btn.role ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <btn.icon size={22} className="text-white" />
                  )}
                </div>
                <p className="font-bold text-sm">{btn.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{btn.desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => window.open(`/signage/${DEMO_CLINIC_ID}`, "_blank")}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 transition-colors"
          >
            <Monitor size={18} />
            サイネージを見る（別タブで開く）
            <ExternalLink size={14} />
          </button>
        </div>

        {/* SaaSメニュー */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-indigo-600 tracking-widest uppercase mb-1">10 SaaS Modules</p>
            <h2 className="text-xl font-bold">クリニックDXをフルカバー</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
            {SAAS_PRODUCTS.map((p) => (
              <div key={p.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 mx-auto mb-2 ${p.bg} rounded-lg flex items-center justify-center`}>
                  <p.icon size={18} className={p.color} />
                </div>
                <p className="text-xs font-bold">{p.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 料金 */}
        <div className="max-w-md mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-center text-white shadow-xl">
          <p className="text-sm opacity-80 mb-2">フルバンドル（10 SaaS）</p>
          <p className="text-4xl font-extrabold mb-1">
            ¥120,000<span className="text-lg font-normal opacity-80">/月</span>
          </p>
          <p className="text-xs opacity-60 mb-4">初期費用 ¥0 ・ 最短3日で導入</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {["電話対応コスト 80%削減", "紙の問診票 0枚", "待ち時間クレーム 90%減", "再診継続率 2倍"].map((t) => (
              <div key={t} className="bg-white/10 rounded-lg py-2 px-3">
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-12">
          © {new Date().getFullYear()} Medixus株式会社 | デモ環境 — 表示されているデータは全て架空です
        </p>
      </div>
    </div>
  );
}

function StandardPortal({ onSelect }: { onSelect: (r: AppRole) => void }) {
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
              onClick={() => onSelect(r.id)}
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
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-12">
          © {new Date().getFullYear()} Medixus株式会社
        </p>
      </div>
    </div>
  );
}
