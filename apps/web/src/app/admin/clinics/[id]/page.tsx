"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  TrendingUp,
  Edit,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import StatusBadge from "@/components/StatusBadge";
import { getClinic, products, formatCurrency } from "@/lib/data";

export default function ClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const clinic = getClinic(id);

  if (!clinic) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">クリニックが見つかりません</p>
      </div>
    );
  }

  const radarData = products
    .filter((p) => p.category === "external")
    .map((p) => ({
      product: p.name.replace("エンジン", "").replace("PF", ""),
      value: clinic.subscribedProducts.includes(p.id) ? 100 : 0,
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          href="/clinics"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{clinic.name}</h1>
            <StatusBadge status={clinic.status} />
            <span
              className={`text-xs font-medium px-2 py-1 rounded-md ${
                clinic.type === "owned"
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {clinic.type === "owned" ? "自社" : "提携"}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{clinic.specialty}</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          <Edit size={16} />
          編集
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg border border-card-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-gray-400 shrink-0" />
                <span>{clinic.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users size={16} className="text-gray-400 shrink-0" />
                <span>担当医師: {clinic.doctorName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <span>{clinic.contactPhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-gray-400 shrink-0" />
                <span>{clinic.contactEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gray-400 shrink-0" />
                <span>
                  契約開始:{" "}
                  {new Date(clinic.joinedAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp size={16} className="text-gray-400 shrink-0" />
                <span>
                  オンライン比率: {(clinic.onlineRatio * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">契約製品</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((product) => {
                const isSubscribed = clinic.subscribedProducts.includes(
                  product.id
                );
                if (
                  product.category === "fullstack-only" &&
                  clinic.type !== "owned"
                )
                  return null;

                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      isSubscribed
                        ? "border-green-200 bg-green-50/50"
                        : "border-gray-100 bg-gray-50/30 opacity-60"
                    }`}
                  >
                    {isSubscribed ? (
                      <CheckCircle2
                        size={18}
                        className="text-success shrink-0"
                      />
                    ) : (
                      <XCircle size={18} className="text-gray-300 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(product.monthlyPrice)}/月
                      </p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: product.color }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card-bg border border-card-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">収益</h2>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">
                {formatCurrency(clinic.mrr)}
              </p>
              <p className="text-sm text-gray-500 mt-1">月額収益 (MRR)</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">契約プラン</span>
                <span className="font-medium">
                  {clinic.plan === "bundle"
                    ? "バンドル"
                    : clinic.plan === "fullstack"
                    ? "フルスタック"
                    : "個別"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">契約製品数</span>
                <span className="font-medium">
                  {clinic.subscribedProducts.length}製品
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">月間患者数</span>
                <span className="font-medium">
                  {clinic.monthlyPatients}件
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">製品カバレッジ</h2>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="product"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Radar
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
