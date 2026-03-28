"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Clock,
  TrendingUp,
  Star,
  Users,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/StatCard";
import { getProduct, clinics, formatCurrency, formatNumber } from "@/lib/data";
import type { ProductId } from "@/lib/types";

interface ModulePageLayoutProps {
  productId: ProductId;
  icon: React.ReactNode;
  children?: React.ReactNode;
}

const trendData = [
  { month: "7月", sessions: 200 },
  { month: "8月", sessions: 580 },
  { month: "9月", sessions: 1200 },
  { month: "10月", sessions: 2100 },
  { month: "11月", sessions: 3400 },
  { month: "12月", sessions: 4800 },
  { month: "1月", sessions: 6200 },
  { month: "2月", sessions: 8100 },
  { month: "3月", sessions: 10500 },
];

export default function ModulePageLayout({
  productId,
  icon,
  children,
}: ModulePageLayoutProps) {
  const product = getProduct(productId);
  if (!product) return null;

  const adoptedClinics = clinics.filter((c) =>
    c.subscribedProducts.includes(productId)
  );
  const activeClinics = adoptedClinics.filter(
    (c) => c.status === "active" || c.status === "trial"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${product.color}15` }}
        >
          <span style={{ color: product.color }}>{icon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-gray-500 text-sm">{product.nameEn}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="導入クリニック"
          value={`${activeClinics.length}院`}
          trend={15}
          trendLabel="前月比"
          icon={<Building2 size={22} />}
          color={product.color}
        />
        <StatCard
          title="月間セッション"
          value={formatNumber(Math.round(activeClinics.length * 1200))}
          trend={22}
          trendLabel="前月比"
          icon={<BarChart3 size={22} />}
          color={product.color}
        />
        <StatCard
          title="平均利用時間"
          value="4.2分"
          trend={-3}
          trendLabel="前月比"
          icon={<Clock size={22} />}
          color={product.color}
        />
        <StatCard
          title="満足度"
          value="4.6/5.0"
          trend={5}
          trendLabel="前月比"
          icon={<Star size={22} />}
          color={product.color}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">利用トレンド</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
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
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke={product.color}
                strokeWidth={2.5}
                dot={{ fill: product.color, r: 4 }}
                name="セッション数"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">導入クリニック</h2>
          <div className="space-y-3">
            {adoptedClinics.map((clinic) => (
              <Link
                key={clinic.id}
                href={`/clinics/${clinic.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                    clinic.type === "owned" ? "bg-accent" : "bg-gray-400"
                  }`}
                >
                  {clinic.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{clinic.name}</p>
                  <p className="text-xs text-gray-400">{clinic.specialty}</p>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    clinic.status === "active"
                      ? "bg-success"
                      : clinic.status === "trial"
                      ? "bg-warning"
                      : "bg-gray-300"
                  }`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {children && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">モジュール機能</h2>
          {children}
        </div>
      )}

      <div className="bg-card-bg border border-card-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-4">機能一覧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {product.features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: product.color }}
              />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
