"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Download,
  Filter,
} from "lucide-react";
import { clinics, products, formatCurrency } from "@/lib/data";
import type { Clinic } from "@/lib/types";

const externalProducts = products.filter((p) => p.category === "external");
const allProducts = products;

export default function SubscriptionsPage() {
  const [showOwned, setShowOwned] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "products" | "mrr">("name");

  const displayProducts = showOwned ? allProducts : externalProducts;
  const filteredClinics = clinics.filter((c) =>
    showOwned ? true : c.type === "partner"
  );

  const sorted = [...filteredClinics].sort((a, b) => {
    if (sortBy === "products")
      return b.subscribedProducts.length - a.subscribedProducts.length;
    if (sortBy === "mrr") return b.mrr - a.mrr;
    return a.name.localeCompare(b.name);
  });

  const totalMRR = sorted
    .filter((c) => c.status === "active" || c.status === "trial")
    .reduce((sum, c) => sum + c.mrr, 0);

  const productAdoption = displayProducts.map((p) => ({
    product: p,
    count: clinics.filter((c) => c.subscribedProducts.includes(p.id)).length,
    rate: (
      (clinics.filter((c) => c.subscribedProducts.includes(p.id)).length /
        clinics.filter((c) => c.status !== "churned").length) *
      100
    ).toFixed(0),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            サブスクリプション管理
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            クリニック × 製品のマトリックス管理
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={16} />
            CSV出力
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-card-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent">
            {formatCurrency(totalMRR)}
          </p>
          <p className="text-xs text-gray-500 mt-1">合計MRR</p>
        </div>
        {productAdoption.slice(0, 3).map(({ product, count, rate }) => (
          <div
            key={product.id}
            className="bg-card-bg border border-card-border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold" style={{ color: product.color }}>
              {rate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {product.name.replace("エンジン", "")} 導入率
            </p>
          </div>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-2xl">
        <div className="p-4 border-b border-card-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-gray-400" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showOwned}
                onChange={(e) => setShowOwned(e.target.checked)}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              自社クリニックも表示
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ArrowUpDown size={14} />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "products" | "mrr")
              }
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none"
            >
              <option value="name">名前順</option>
              <option value="products">製品数順</option>
              <option value="mrr">MRR順</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50/50 z-10 min-w-[200px]">
                  クリニック
                </th>
                {displayProducts.map((p) => (
                  <th
                    key={p.id}
                    className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider min-w-[80px]"
                    style={{ color: p.color }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="truncate max-w-[70px]">
                        {p.name
                          .replace("エンジン", "")
                          .replace("PF", "")
                          .replace("接続", "")}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {formatCurrency(p.monthlyPrice)}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">
                  MRR
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((clinic) => (
                <tr
                  key={clinic.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                    clinic.status === "churned" ? "opacity-40" : ""
                  }`}
                >
                  <td className="px-4 py-3 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                          clinic.type === "owned"
                            ? "bg-accent"
                            : "bg-gray-400"
                        }`}
                      >
                        {clinic.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[160px]">
                          {clinic.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {clinic.type === "owned" ? "自社" : "提携"} ·{" "}
                          {clinic.plan === "bundle"
                            ? "バンドル"
                            : clinic.plan === "fullstack"
                            ? "フルスタック"
                            : "個別"}
                        </p>
                      </div>
                    </div>
                  </td>
                  {displayProducts.map((p) => {
                    const isSubscribed = clinic.subscribedProducts.includes(
                      p.id
                    );
                    const isAvailable =
                      p.category === "external" || clinic.type === "owned";
                    return (
                      <td key={p.id} className="text-center px-3 py-3">
                        {!isAvailable ? (
                          <span className="text-gray-200">—</span>
                        ) : isSubscribed ? (
                          <CheckCircle2
                            size={20}
                            className="mx-auto text-success"
                          />
                        ) : (
                          <XCircle
                            size={20}
                            className="mx-auto text-gray-200"
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="text-right px-4 py-3">
                    <span className="text-sm font-semibold">
                      {formatCurrency(clinic.mrr)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
