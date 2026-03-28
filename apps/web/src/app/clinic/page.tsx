"use client";

import {
  Users,
  Video,
  Brain,
  Activity,
  AlertTriangle,
  Clock,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useClinic } from "@/lib/clinic-context";
import { todayAppointments, vitalAlerts, patients } from "@/lib/clinic-data";
import { products } from "@/lib/data";
import type { ProductId } from "@/lib/types";

const quickLinks: { label: string; href: string; icon: React.ReactNode; productId: ProductId; color: string }[] = [
  { label: "AI問診を開始", href: "/clinic/ai-triage", icon: <Brain size={24} />, productId: "ai-triage", color: "#6366f1" },
  { label: "オンライン診療", href: "/clinic/online-consultation", icon: <Video size={24} />, productId: "online-consultation", color: "#06b6d4" },
  { label: "モニタリング確認", href: "/clinic/remote-monitoring", icon: <Activity size={24} />, productId: "remote-monitoring", color: "#10b981" },
];

const apptStatusStyle: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: "bg-gray-100", text: "text-gray-500", label: "完了" },
  "in-progress": { bg: "bg-green-100", text: "text-green-700", label: "診察中" },
  waiting: { bg: "bg-amber-100", text: "text-amber-700", label: "待機中" },
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "予定" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", label: "キャンセル" },
  "no-show": { bg: "bg-red-100", text: "text-red-600", label: "未来院" },
};

export default function ClinicHome() {
  const { currentClinic } = useClinic();
  const has = (pid: ProductId) => currentClinic.subscribedProducts.includes(pid);

  const completed = todayAppointments.filter((a) => a.status === "completed").length;
  const total = todayAppointments.length;
  const unresolvedAlerts = vitalAlerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          おはようございます、{currentClinic.doctorName}先生
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {currentClinic.name} · {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-card-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <CalendarDays size={16} /> 本日の予約
          </div>
          <p className="text-3xl font-bold">{total}<span className="text-lg text-gray-400 ml-1">件</span></p>
          <p className="text-xs text-gray-400 mt-1">{completed}件完了 · {total - completed}件残り</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Video size={16} /> オンライン診療
          </div>
          <p className="text-3xl font-bold">{todayAppointments.filter((a) => a.type === "online").length}<span className="text-lg text-gray-400 ml-1">件</span></p>
          <p className="text-xs text-gray-400 mt-1">本日予定</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Users size={16} /> 登録患者
          </div>
          <p className="text-3xl font-bold">{patients.length}<span className="text-lg text-gray-400 ml-1">名</span></p>
          <p className="text-xs text-gray-400 mt-1">アクティブ患者</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-2">
            <AlertTriangle size={16} /> 未対応アラート
          </div>
          <p className="text-3xl font-bold text-red-600">{unresolvedAlerts}<span className="text-lg text-gray-400 ml-1">件</span></p>
          <p className="text-xs text-gray-400 mt-1">要確認</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const available = has(link.productId);
          return available ? (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 bg-card-bg border border-card-border rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition-all group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${link.color}12` }}
              >
                <span style={{ color: link.color }}>{link.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{link.label}</p>
                <p className="text-xs text-gray-400">クリックで開く</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          ) : (
            <div
              key={link.href}
              className="flex items-center gap-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 opacity-50"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Lock size={20} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-500">{link.label}</p>
                <p className="text-xs text-gray-400">未契約</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock size={18} className="text-gray-500" />
            本日のスケジュール
          </h2>
          <div className="space-y-2">
            {todayAppointments.map((appt) => {
              const st = apptStatusStyle[appt.status];
              return (
                <div
                  key={appt.id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                    appt.status === "in-progress"
                      ? "bg-green-50 border border-green-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center min-w-[48px]">
                    <p className="text-base font-bold text-gray-700">{appt.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{appt.patientName}</p>
                      {appt.type === "online" && (
                        <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-medium">
                          オンライン
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{appt.reason}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${st.bg} ${st.text}`}>
                    {appt.status === "in-progress" && (
                      <CircleDot size={10} className="inline mr-1 animate-pulse-dot" />
                    )}
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">契約SaaS製品</h2>
          <div className="space-y-2">
            {products
              .filter((p) => p.category === "external")
              .map((p) => {
                const isActive = currentClinic.subscribedProducts.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isActive
                        ? "border-green-200 bg-green-50/30"
                        : "border-dashed border-gray-200 bg-gray-50/30 opacity-50"
                    }`}
                  >
                    {isActive ? (
                      <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                    ) : (
                      <Lock size={18} className="text-gray-300 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.nameEn}</p>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={
                        isActive
                          ? { color: p.color, backgroundColor: `${p.color}12` }
                          : { color: "#9ca3af", backgroundColor: "#f3f4f6" }
                      }
                    >
                      {isActive ? "利用可能" : "未契約"}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
