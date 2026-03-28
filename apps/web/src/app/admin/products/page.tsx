"use client";

import {
  Brain,
  Video,
  Activity,
  Smartphone,
  Network,
  FileText,
  Calculator,
  Check,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { products, clinics, formatCurrency } from "@/lib/data";
import type { Product } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain size={28} />,
  Video: <Video size={28} />,
  Activity: <Activity size={28} />,
  Smartphone: <Smartphone size={28} />,
  Network: <Network size={28} />,
  FileText: <FileText size={28} />,
  Calculator: <Calculator size={28} />,
};

const modulePathMap: Record<string, string> = {
  "ai-triage": "/modules/ai-triage",
  "online-consultation": "/modules/online-consultation",
  "remote-monitoring": "/modules/remote-monitoring",
  "patient-app": "/modules/patient-app",
  "partner-network": "/modules/partner-network",
};

function ProductCard({ product }: { product: Product }) {
  const adoptionCount = clinics.filter((c) =>
    c.subscribedProducts.includes(product.id)
  ).length;
  const modulePath = modulePathMap[product.id];

  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${product.color}15` }}
        >
          <span style={{ color: product.color }}>
            {iconMap[product.icon]}
          </span>
        </div>
        {product.category === "fullstack-only" && (
          <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
            自社クリニック専用
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold">{product.name}</h3>
      <p className="text-xs text-gray-400 font-mono">{product.nameEn}</p>
      <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-2">
        {product.description}
      </p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color: product.color }}>
          {formatCurrency(product.monthlyPrice)}
        </span>
        <span className="text-sm text-gray-400">/月</span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-2">主要機能</p>
        <div className="space-y-1.5">
          {product.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <Check size={14} style={{ color: product.color }} />
              <span className="text-gray-600">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Building2 size={14} />
          <span>{adoptionCount}院が導入</span>
        </div>
        {modulePath && (
          <Link
            href={modulePath}
            className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: product.color }}
          >
            モジュール <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const externalProducts = products.filter((p) => p.category === "external");
  const fullstackProducts = products.filter(
    (p) => p.category === "fullstack-only"
  );
  const bundlePrice = externalProducts.reduce(
    (sum, p) => sum + p.monthlyPrice,
    0
  );
  const fullstackPrice = products.reduce(
    (sum, p) => sum + p.monthlyPrice,
    0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SaaS製品カタログ</h1>
        <p className="text-gray-500 text-sm mt-1">
          提携クリニック向け・自社クリニック向け製品一覧
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold">提携バンドル（5点セット）</h3>
          <p className="text-indigo-100 text-sm mt-1">
            AI問診 + オンライン診療PF + 遠隔モニタリング + 患者アプリ +
            提携NW
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatCurrency(bundlePrice - 20000)}
            </span>
            <span className="text-indigo-200">/月</span>
            <span className="text-sm line-through text-indigo-300 ml-2">
              {formatCurrency(bundlePrice)}
            </span>
          </div>
          <p className="text-xs text-indigo-200 mt-2">
            個別合計より¥20,000お得
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold">
            フルスタック（自社クリニック）
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            全7製品 + BPO + 機器リース + 不動産
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatCurrency(1050000)}
            </span>
            <span className="text-slate-400">/月</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            SaaS + BPO + リース + 不動産 全込み
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          提携クリニック向け製品
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {externalProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          自社クリニック専用製品
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fullstackProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
