"use client";

import {
  TrendingUp,
  Building2,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { kpiHistory, clinics, products, formatCurrency } from "@/lib/data";

const revenueByProduct = products
  .filter((p) => p.category === "external")
  .map((p) => {
    const subscribedClinics = clinics.filter(
      (c) =>
        c.subscribedProducts.includes(p.id) &&
        (c.status === "active" || c.status === "trial")
    );
    return {
      name: p.name.replace("エンジン", "").replace("PF", ""),
      revenue: subscribedClinics.length * p.monthlyPrice,
      color: p.color,
    };
  });

const revenueByPlan = [
  {
    name: "バンドル",
    value: clinics
      .filter((c) => c.plan === "bundle" && c.status !== "churned")
      .reduce((s, c) => s + c.mrr, 0),
    color: "#6366f1",
  },
  {
    name: "個別",
    value: clinics
      .filter((c) => c.plan === "individual" && c.status !== "churned")
      .reduce((s, c) => s + c.mrr, 0),
    color: "#06b6d4",
  },
  {
    name: "フルスタック",
    value: clinics
      .filter((c) => c.plan === "fullstack" && c.status !== "churned")
      .reduce((s, c) => s + c.mrr, 0),
    color: "#10b981",
  },
];

const goTargets = [
  {
    name: "PMF (300件/月)",
    current: 850,
    target: 300,
    achieved: true,
    icon: <Target size={16} />,
  },
  {
    name: "MRR 150万円",
    current: 1660000,
    target: 1500000,
    achieved: true,
    icon: <TrendingUp size={16} />,
  },
  {
    name: "提携 10院+",
    current: 11,
    target: 10,
    achieved: true,
    icon: <Building2 size={16} />,
  },
  {
    name: "6M継続率 85%+",
    current: 92,
    target: 85,
    achieved: true,
    icon: <Users size={16} />,
  },
];

export default function AnalyticsPage() {
  const latestKpi = kpiHistory[kpiHistory.length - 1];
  const prevKpi = kpiHistory[kpiHistory.length - 2];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">収益分析</h1>
        <p className="text-gray-500 text-sm mt-1">
          KPIトラッキング・収益分析・GO判断指標
        </p>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">GO判断指標</h2>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            全て達成
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {goTargets.map((t) => (
            <div key={t.name} className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {t.icon}
                <span className="text-xs font-medium opacity-80">
                  {t.name}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {typeof t.current === "number" && t.current > 10000
                  ? formatCurrency(t.current)
                  : t.name.includes("継続率")
                  ? `${t.current}%`
                  : t.name.includes("院")
                  ? `${t.current}院`
                  : `${t.current}件`}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} />
                <span className="text-xs opacity-80">目標達成</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">MRR推移</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={kpiHistory}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
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
                }}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#mrrGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">製品別収益</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByProduct}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
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
                formatter={(value) => [formatCurrency(Number(value)), "月間収益"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                {revenueByProduct.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">プラン別収益構成</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={revenueByPlan}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {revenueByPlan.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "収益"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {revenueByPlan.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                {p.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">患者数推移</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={kpiHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="totalPatients"
                stroke="#6366f1"
                strokeWidth={2}
                name="全体"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="onlinePatients"
                stroke="#06b6d4"
                strokeWidth={2}
                name="オンライン"
                dot={{ r: 3 }}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">継続率推移</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={kpiHistory.slice(3)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[80, 100]}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "継続率"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="continuationRate"
                stroke="#10b981"
                strokeWidth={2.5}
                name="継続率"
                dot={{ fill: "#10b981", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-4">月次KPIサマリー</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  月
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  提携院
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  自社院
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  患者数
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  オンライン
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  MRR
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  継続率
                </th>
              </tr>
            </thead>
            <tbody>
              {kpiHistory.map((kpi, i) => {
                const prev = i > 0 ? kpiHistory[i - 1] : null;
                const mrrChange = prev
                  ? ((kpi.mrr - prev.mrr) / prev.mrr) * 100
                  : 0;
                return (
                  <tr
                    key={kpi.month}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {kpi.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {kpi.partnerClinics}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {kpi.ownedClinics}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {kpi.totalPatients.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {kpi.onlinePatients.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-sm font-semibold">
                          {formatCurrency(kpi.mrr)}
                        </span>
                        {mrrChange !== 0 && (
                          <span
                            className={`text-[10px] flex items-center ${
                              mrrChange > 0
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {mrrChange > 0 ? (
                              <ArrowUpRight size={10} />
                            ) : (
                              <ArrowDownRight size={10} />
                            )}
                            {Math.abs(mrrChange).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {kpi.continuationRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
