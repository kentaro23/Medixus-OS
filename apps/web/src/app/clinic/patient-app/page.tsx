"use client";

import { useState } from "react";
import {
  Smartphone,
  Bell,
  Send,
  Users,
  MessageSquare,
  BarChart3,
  Pill,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  X,
  TrendingUp,
  Eye,
  Heart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { patients } from "@/lib/clinic-data";

const engagementData = [
  { day: "月", opens: 45, actions: 32 },
  { day: "火", opens: 52, actions: 38 },
  { day: "水", opens: 48, actions: 35 },
  { day: "木", opens: 60, actions: 42 },
  { day: "金", opens: 55, actions: 40 },
  { day: "土", opens: 35, actions: 22 },
  { day: "日", opens: 28, actions: 18 },
];

const notifications = [
  { id: 1, title: "服薬リマインド（朝）", schedule: "毎日 8:00", recipients: "全患者", status: "active", opens: 85 },
  { id: 2, title: "服薬リマインド（夜）", schedule: "毎日 20:00", recipients: "全患者", status: "active", opens: 78 },
  { id: 3, title: "血圧測定リマインド", schedule: "毎日 7:00", recipients: "高血圧患者", status: "active", opens: 72 },
  { id: 4, title: "血糖値測定リマインド", schedule: "毎日 7:00 / 12:00 / 18:00", recipients: "糖尿病患者", status: "active", opens: 68 },
  { id: 5, title: "次回予約リマインド", schedule: "予約3日前", recipients: "予約あり", status: "active", opens: 90 },
  { id: 6, title: "健康コラム配信", schedule: "毎週月曜 10:00", recipients: "全患者", status: "paused", opens: 45 },
];

const contentItems = [
  { id: 1, title: "高血圧を管理する5つのポイント", category: "コラム", published: "2026-10-28", views: 234, type: "article" },
  { id: 2, title: "糖尿病と食事療法", category: "コラム", published: "2026-10-21", views: 189, type: "article" },
  { id: 3, title: "正しい血圧の測り方（動画）", category: "ガイド", published: "2026-10-15", views: 312, type: "video" },
  { id: 4, title: "お薬手帳の使い方", category: "ガイド", published: "2026-10-10", views: 156, type: "article" },
  { id: 5, title: "インフルエンザ予防接種のお知らせ", category: "お知らせ", published: "2026-11-01", views: 420, type: "notice" },
];

const patientEngagement = patients.slice(0, 6).map((p) => ({
  ...p,
  lastAppOpen: `${Math.floor(Math.random() * 24)}時間前`,
  medicationAdherence: Math.round(70 + Math.random() * 30),
  vitalRecordRate: Math.round(50 + Math.random() * 50),
}));

export default function PatientAppPage() {
  const [tab, setTab] = useState<"overview" | "notifications" | "content" | "patients">("overview");
  const [showNewNotif, setShowNewNotif] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Smartphone size={28} className="text-amber-500" /> 患者アプリ管理
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            患者向けアプリの通知・コンテンツ管理、エンゲージメント分析
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{patients.length}</p>
          <p className="text-xs text-gray-500 mt-1">アプリ登録患者</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">82%</p>
          <p className="text-xs text-gray-500 mt-1">平均服薬遵守率</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">68%</p>
          <p className="text-xs text-gray-500 mt-1">バイタル記録率</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">4.5</p>
          <p className="text-xs text-gray-500 mt-1">アプリ評価</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "overview" as const, label: "概要", icon: <BarChart3 size={14} /> },
          { id: "notifications" as const, label: "通知管理", icon: <Bell size={14} /> },
          { id: "content" as const, label: "コンテンツ", icon: <FileText size={14} /> },
          { id: "patients" as const, label: "患者エンゲージメント", icon: <Users size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === t.id ? "border-amber-500 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-card-bg border border-card-border rounded-2xl p-6">
            <h3 className="font-semibold mb-4">週間アプリ利用状況</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="opens" name="アプリ起動" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actions" name="アクション" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card-bg border border-card-border rounded-2xl p-6">
            <h3 className="font-semibold mb-4">主要機能の利用率</h3>
            <div className="space-y-4">
              {[
                { name: "服薬リマインド確認", rate: 85, color: "#10b981" },
                { name: "バイタル記録", rate: 68, color: "#3b82f6" },
                { name: "予約確認・変更", rate: 72, color: "#8b5cf6" },
                { name: "検査結果閲覧", rate: 55, color: "#f59e0b" },
                { name: "医師メッセージ", rate: 45, color: "#06b6d4" },
                { name: "健康コラム閲覧", rate: 32, color: "#ec4899" },
              ].map((feat) => (
                <div key={feat.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{feat.name}</span>
                    <span className="font-semibold">{feat.rate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${feat.rate}%`, backgroundColor: feat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="bg-card-bg border border-card-border rounded-2xl">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <h3 className="font-semibold">プッシュ通知設定</h3>
            <button
              onClick={() => setShowNewNotif(true)}
              className="flex items-center gap-1.5 text-sm bg-amber-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-amber-600 transition-colors"
            >
              <Plus size={14} /> 新規通知
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  notif.status === "active" ? "bg-green-100" : "bg-gray-100"
                }`}>
                  <Bell size={18} className={notif.status === "active" ? "text-green-600" : "text-gray-400"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{notif.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      notif.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {notif.status === "active" ? "有効" : "一時停止"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <Clock size={10} className="inline mr-1" />{notif.schedule}
                    <span className="mx-1.5">·</span>
                    <Users size={10} className="inline mr-1" />{notif.recipients}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">{notif.opens}%</p>
                  <p className="text-[10px] text-gray-400">開封率</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "content" && (
        <div className="bg-card-bg border border-card-border rounded-2xl">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <h3 className="font-semibold">配信コンテンツ</h3>
            <button className="flex items-center gap-1.5 text-sm bg-amber-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-amber-600 transition-colors">
              <Plus size={14} /> 新規作成
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {contentItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.type === "article" ? "bg-blue-100 text-blue-600" :
                  item.type === "video" ? "bg-purple-100 text-purple-600" :
                  "bg-amber-100 text-amber-600"
                }`}>
                  <FileText size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.category} · {new Date(item.published).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Eye size={14} /> {item.views}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "patients" && (
        <div className="bg-card-bg border border-card-border rounded-2xl">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold">患者別エンゲージメント</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">患者</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">最終起動</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">服薬遵守率</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">バイタル記録率</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">リスク</th>
                </tr>
              </thead>
              <tbody>
                {patientEngagement.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.age}歳 {p.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{p.lastAppOpen}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${p.medicationAdherence}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{p.medicationAdherence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.vitalRecordRate}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{p.vitalRecordRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        p.riskLevel === "high" ? "bg-red-100 text-red-700" :
                        p.riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {p.riskLevel === "high" ? "高" : p.riskLevel === "medium" ? "中" : "低"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showNewNotif && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">新規プッシュ通知</h2>
              <button onClick={() => setShowNewNotif(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">タイトル</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30" placeholder="例: 服薬リマインド" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">メッセージ</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 h-20 resize-none" placeholder="通知メッセージを入力..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">対象</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                  <option>全患者</option>
                  <option>高血圧患者</option>
                  <option>糖尿病患者</option>
                  <option>特定の患者</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">スケジュール</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                  <option>即時送信</option>
                  <option>毎日</option>
                  <option>毎週</option>
                  <option>カスタム</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNewNotif(false)} className="px-4 py-2 text-sm text-gray-600">キャンセル</button>
              <button onClick={() => setShowNewNotif(false)} className="px-6 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 flex items-center gap-1.5">
                <Send size={14} /> 送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
