"use client";

import {
  Building2,
  Users,
  TrendingUp,
  Activity,
  Video,
  Brain,
  ArrowRight,
  CircleDot,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import {
  clinics,
  kpiHistory,
  alerts,
  products,
  getTotalMRR,
  formatCurrency,
  formatNumber,
  getActiveClinics,
} from "@/lib/data";

const activeClinics = getActiveClinics();
const totalMRR = getTotalMRR();
const partnerCount = clinics.filter(
  (c) => c.type === "partner" && (c.status === "active" || c.status === "trial")
).length;
const ownedCount = clinics.filter(
  (c) => c.type === "owned" && c.status === "active"
).length;
const totalOnlinePatients = activeClinics.reduce(
  (sum, c) => sum + Math.round(c.monthlyPatients * c.onlineRatio),
  0
);
const totalPatients = activeClinics.reduce(
  (sum, c) => sum + c.monthlyPatients,
  0
);

const productAdoption = products
  .filter((p) => p.category === "external")
  .map((p) => ({
    name: p.name.replace("エンジン", "").replace("PF", ""),
    clinics: clinics.filter((c) => c.subscribedProducts.includes(p.id)).length,
    color: p.color,
  }));

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-gray-500 text-sm mt-1">
            MedixusOS 統合管理コンソール
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CircleDot size={14} className="text-success animate-pulse-dot" />
          全システム正常稼働
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="提携クリニック"
          value={`${partnerCount}院`}
          subtitle={`+${ownedCount}院（自社）`}
          trend={15}
          trendLabel="前月比"
          icon={<Building2 size={24} />}
          color="#6366f1"
        />
        <StatCard
          title="月次収益 (MRR)"
          value={formatCurrency(totalMRR)}
          subtitle="MS法人側"
          trend={22}
          trendLabel="前月比"
          icon={<TrendingUp size={24} />}
          color="#10b981"
        />
        <StatCard
          title="オンライン診療"
          value={`${formatNumber(totalOnlinePatients)}件/月`}
          subtitle={`全体${formatNumber(totalPatients)}件中`}
          trend={18}
          trendLabel="前月比"
          icon={<Video size={24} />}
          color="#06b6d4"
        />
        <StatCard
          title="AI問診セッション"
          value="12,500件"
          subtitle="累計"
          trend={12}
          trendLabel="前月比"
          icon={<Brain size={24} />}
          color="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card-bg border border-card-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">MRR推移</h2>
            <Link
              href="/analytics"
              className="text-sm text-accent hover:text-accent-light flex items-center gap-1"
            >
              詳細 <ArrowRight size={14} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={kpiHistory}>
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "MRR"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#mrrGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">製品導入状況</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productAdoption} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                formatter={(value) => [`${value}院`, "導入数"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="clinics" radius={[0, 6, 6, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">最近のアクティビティ</h2>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                    alert.type === "success"
                      ? "bg-success"
                      : alert.type === "warning"
                      ? "bg-warning"
                      : alert.type === "error"
                      ? "bg-danger"
                      : "bg-info"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {alert.message}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(alert.timestamp).toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">クリニック一覧</h2>
            <Link
              href="/clinics"
              className="text-sm text-accent hover:text-accent-light flex items-center gap-1"
            >
              全て表示 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {clinics.slice(0, 6).map((clinic) => (
              <Link
                key={clinic.id}
                href={`/clinics/${clinic.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                      clinic.type === "owned" ? "bg-accent" : "bg-gray-400"
                    }`}
                  >
                    {clinic.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{clinic.name}</p>
                    <p className="text-xs text-gray-500">
                      {clinic.subscribedProducts.length}製品 ·{" "}
                      {formatCurrency(clinic.mrr)}/月
                    </p>
                  </div>
                </div>
                <StatusBadge status={clinic.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
