"use client";

import {
  Users, Video, Brain, Activity, AlertTriangle, Clock,
  CalendarDays, ArrowRight, CheckCircle2, CircleDot, Lock,
  PhoneCall, MessageSquare, TrendingUp, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useClinic } from "@/lib/clinic-context";
import { todayAppointments, vitalAlerts, patients } from "@/lib/clinic-data";
import { products } from "@/lib/data";
import type { ProductId } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

const quickLinks: { label: string; href: string; icon: React.ReactNode; productId: ProductId; color: string; desc: string }[] = [
  { label: "AI問診", href: "/clinic/ai-triage", icon: <Brain size={22} />, productId: "ai-triage", color: "#6366f1", desc: "患者の問診を自動化" },
  { label: "オンライン診療", href: "/clinic/online-consultation", icon: <Video size={22} />, productId: "online-consultation", color: "#06b6d4", desc: "ビデオ診療を開始" },
  { label: "遠隔モニタリング", href: "/clinic/remote-monitoring", icon: <Activity size={22} />, productId: "remote-monitoring", color: "#10b981", desc: "患者バイタルを確認" },
];

const apptStatusStyle: Record<string, { bg: string; text: string; label: string; dot?: boolean }> = {
  completed:   { bg: "bg-gray-100",   text: "text-gray-500",  label: "完了" },
  "in-progress": { bg: "bg-green-100", text: "text-green-700", label: "診察中", dot: true },
  waiting:     { bg: "bg-amber-100",  text: "text-amber-700", label: "待機中" },
  scheduled:   { bg: "bg-blue-100",   text: "text-blue-700",  label: "予定" },
  cancelled:   { bg: "bg-red-100",    text: "text-red-600",   label: "キャンセル" },
  "no-show":   { bg: "bg-red-100",    text: "text-red-600",   label: "未来院" },
};

interface PhoneStats {
  todayTotal: number;
  pendingCallback: number;
  appointmentCalls: number;
  emergencyCalls: number;
}

export default function ClinicHome() {
  const { currentClinic } = useClinic();
  const has = (pid: ProductId) => currentClinic.subscribedProducts.includes(pid);

  const completed = todayAppointments.filter((a) => a.status === "completed").length;
  const total = todayAppointments.length;
  const unresolvedAlerts = vitalAlerts.filter((a) => !a.acknowledged).length;
  const inProgress = todayAppointments.find((a) => a.status === "in-progress");

  const [phoneStats, setPhoneStats] = useState<PhoneStats>({
    todayTotal: 0, pendingCallback: 0, appointmentCalls: 0, emergencyCalls: 0,
  });
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 時計
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 電話統計を取得
  const fetchPhoneStats = useCallback(async () => {
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/phone/logs?limit=200");
      if (res.ok) {
        const data = await res.json();
        const logs = data.logs ?? [];
        const today = new Date().toISOString().split("T")[0];
        const todayLogs = logs.filter((l: Record<string, string>) =>
          (l.started_at || l.created_at || "").startsWith(today)
        );
        setPhoneStats({
          todayTotal: todayLogs.length,
          pendingCallback: todayLogs.filter((l: Record<string, boolean>) => l.transferred_to_staff).length,
          appointmentCalls: todayLogs.filter((l: Record<string, string>) => l.purpose === "appointment").length,
          emergencyCalls: todayLogs.filter((l: Record<string, string>) => l.purpose === "emergency").length,
        });
      }
    } catch {
      // デモデータでフォールバック
      setPhoneStats({ todayTotal: 7, pendingCallback: 2, appointmentCalls: 3, emergencyCalls: 0 });
    } finally {
      setPhoneLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhoneStats();
    const t = setInterval(fetchPhoneStats, 60_000);
    return () => clearInterval(t);
  }, [fetchPhoneStats]);

  // 時間帯別挨拶
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "おはようございます" : hour < 18 ? "こんにちは" : "お疲れさまです";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}、{currentClinic.doctorName}先生
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {currentClinic.name} · {currentTime.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800 font-mono tracking-wider">
            {currentTime.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {currentTime.toLocaleTimeString("ja-JP", { second: "2-digit" })}秒
          </p>
        </div>
      </div>

      {/* 診察中バナー */}
      {inProgress && (
        <div className="bg-green-50 border border-green-300 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <CircleDot size={20} className="text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-900">現在診察中: {inProgress.patientName} 様</p>
            <p className="text-xs text-green-700">{inProgress.reason} · {inProgress.time} 開始</p>
          </div>
          <Link href="/clinic/queue">
            <button className="text-sm text-green-700 hover:text-green-900 font-medium flex items-center gap-1">
              順番管理 <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      )}

      {/* KPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/clinic/queue">
          <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <CalendarDays size={16} /> 本日の予約
            </div>
            <p className="text-3xl font-bold">{total}<span className="text-lg text-gray-400 ml-1">件</span></p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">{completed}/{total} 完了</p>
            </div>
          </div>
        </Link>

        <Link href="/clinic/online-consultation">
          <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Video size={16} /> オンライン診療
            </div>
            <p className="text-3xl font-bold">
              {todayAppointments.filter((a) => a.type === "online").length}
              <span className="text-lg text-gray-400 ml-1">件</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">本日予定</p>
          </div>
        </Link>

        <Link href="/clinic/queue">
          <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Users size={16} /> 登録患者
            </div>
            <p className="text-3xl font-bold">{patients.length}<span className="text-lg text-gray-400 ml-1">名</span></p>
            <p className="text-xs text-gray-400 mt-1">アクティブ患者</p>
          </div>
        </Link>

        <Link href="/clinic/remote-monitoring">
          <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-red-500 text-sm mb-2">
              <AlertTriangle size={16} /> 未対応アラート
            </div>
            <p className="text-3xl font-bold text-red-600">
              {unresolvedAlerts}<span className="text-lg text-gray-400 ml-1">件</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {unresolvedAlerts > 0 ? "要確認" : "すべて対応済み"}
            </p>
          </div>
        </Link>
      </div>

      {/* クイックリンク */}
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
                style={{ backgroundColor: `${link.color}15` }}
              >
                <span style={{ color: link.color }}>{link.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{link.label}</p>
                <p className="text-xs text-gray-400">{link.desc}</p>
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
                <p className="text-xs text-gray-400">未契約 · お問い合わせください</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 本日のスケジュール */}
        <div className="xl:col-span-2 bg-card-bg border border-card-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              本日のスケジュール
            </h2>
            <Link href="/clinic/queue">
              <button className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1">
                順番管理を開く <ArrowRight size={12} />
              </button>
            </Link>
          </div>
          <div className="space-y-1.5">
            {todayAppointments.map((appt) => {
              const st = apptStatusStyle[appt.status];
              const isActive = appt.status === "in-progress";
              return (
                <div
                  key={appt.id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                    isActive ? "bg-green-50 border border-green-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center min-w-[48px]">
                    <p className="text-sm font-bold text-gray-700">{appt.time}</p>
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
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${st.bg} ${st.text}`}>
                    {isActive && <CircleDot size={10} className="animate-pulse" />}
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右カラム */}
        <div className="space-y-4">
          {/* AI電話受付ウィジェット */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <PhoneCall size={16} className="text-cyan-600" />
                AI電話受付（本日）
              </h2>
              <div className="flex items-center gap-2">
                {phoneLoading && <RefreshCw size={12} className="text-gray-400 animate-spin" />}
                <Link href="/clinic/phone">
                  <button className="text-xs text-cyan-600 hover:text-cyan-800">詳細 →</button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{phoneStats.todayTotal}</p>
                <p className="text-xs text-gray-500">総通話数</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${phoneStats.pendingCallback > 0 ? "bg-orange-50" : "bg-gray-50"}`}>
                <p className={`text-2xl font-bold ${phoneStats.pendingCallback > 0 ? "text-orange-700" : ""}`}>
                  {phoneStats.pendingCallback}
                </p>
                <p className="text-xs text-gray-500">折り返し待ち</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{phoneStats.appointmentCalls}</p>
                <p className="text-xs text-gray-500">予約受付</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${phoneStats.emergencyCalls > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <p className={`text-2xl font-bold ${phoneStats.emergencyCalls > 0 ? "text-red-700" : ""}`}>
                  {phoneStats.emergencyCalls}
                </p>
                <p className="text-xs text-gray-500">緊急対応</p>
              </div>
            </div>
            {phoneStats.pendingCallback > 0 && (
              <Link href="/clinic/phone">
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2 hover:bg-orange-100 transition-colors cursor-pointer">
                  <MessageSquare size={14} className="text-orange-600 shrink-0" />
                  <p className="text-xs text-orange-700 font-medium">
                    {phoneStats.pendingCallback}件の折り返し対応が必要です
                  </p>
                  <ArrowRight size={12} className="text-orange-500 ml-auto" />
                </div>
              </Link>
            )}
          </div>

          {/* 契約SaaS製品 */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-500" />
                契約SaaS製品
              </h2>
            </div>
            <div className="space-y-2">
              {products
                .filter((p) => p.category === "external")
                .slice(0, 5)
                .map((p) => {
                  const isActive = currentClinic.subscribedProducts.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                        isActive
                          ? "border-green-200 bg-green-50/30"
                          : "border-dashed border-gray-200 bg-gray-50/30 opacity-50"
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      ) : (
                        <Lock size={16} className="text-gray-300 shrink-0" />
                      )}
                      <p className="text-sm font-medium flex-1">{p.name}</p>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={
                          isActive
                            ? { color: p.color, backgroundColor: `${p.color}15` }
                            : { color: "#9ca3af", backgroundColor: "#f3f4f6" }
                        }
                      >
                        {isActive ? "利用中" : "未契約"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
