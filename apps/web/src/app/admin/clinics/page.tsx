"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  Stethoscope,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { clinics, products, formatCurrency } from "@/lib/data";
import type { ClinicStatus } from "@/lib/types";

type FilterType = "all" | "partner" | "owned";
type StatusFilter = "all" | ClinicStatus;

export default function ClinicsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = clinics.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: clinics.length,
    active: clinics.filter((c) => c.status === "active").length,
    trial: clinics.filter((c) => c.status === "trial").length,
    churned: clinics.filter((c) => c.status === "churned").length,
    onboarding: clinics.filter((c) => c.status === "onboarding").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">クリニック管理</h1>
          <p className="text-gray-500 text-sm mt-1">
            提携・自社クリニックの統合管理
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-light transition-colors"
        >
          <Plus size={18} />
          クリニック追加
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "合計", value: stats.total, color: "bg-gray-100 text-gray-700" },
          { label: "稼働中", value: stats.active, color: "bg-emerald-50 text-emerald-700" },
          { label: "トライアル", value: stats.trial, color: "bg-amber-50 text-amber-700" },
          { label: "導入中", value: stats.onboarding, color: "bg-blue-50 text-blue-700" },
          { label: "解約済", value: stats.churned, color: "bg-red-50 text-red-700" },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.color} rounded-xl px-4 py-3 text-center`}
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-2xl">
        <div className="p-4 border-b border-card-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="クリニック名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FilterType)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="all">全タイプ</option>
              <option value="partner">提携</option>
              <option value="owned">自社</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="all">全ステータス</option>
              <option value="active">稼働中</option>
              <option value="trial">トライアル</option>
              <option value="onboarding">導入中</option>
              <option value="churned">解約済</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    クリニック <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  タイプ
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  契約製品
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  MRR
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  月間患者数
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((clinic) => (
                <tr
                  key={clinic.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                          clinic.type === "owned"
                            ? "bg-accent"
                            : "bg-gray-400"
                        }`}
                      >
                        {clinic.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{clinic.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <MapPin size={10} />
                          {clinic.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${
                        clinic.type === "owned"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {clinic.type === "owned" ? "自社" : "提携"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={clinic.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {clinic.subscribedProducts.slice(0, 3).map((pid) => {
                        const product = products.find((p) => p.id === pid);
                        return product ? (
                          <span
                            key={pid}
                            className="text-[10px] px-1.5 py-0.5 rounded-md border font-medium"
                            style={{
                              borderColor: `${product.color}40`,
                              color: product.color,
                              backgroundColor: `${product.color}08`,
                            }}
                          >
                            {product.name
                              .replace("エンジン", "")
                              .replace("PF", "")}
                          </span>
                        ) : null;
                      })}
                      {clinic.subscribedProducts.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium">
                          +{clinic.subscribedProducts.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-semibold">
                      {formatCurrency(clinic.mrr)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm">
                      {clinic.monthlyPatients > 0
                        ? `${clinic.monthlyPatients}件`
                        : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/clinics/${clinic.id}`}
                      className="inline-flex items-center gap-1 text-accent hover:text-accent-light text-sm"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in">
            <h2 className="text-lg font-bold mb-4">新規クリニック追加</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  クリニック名
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  placeholder="例: 田中内科クリニック"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    タイプ
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                    <option>提携</option>
                    <option>自社</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    診療科
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    placeholder="例: 内科"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  住所
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  placeholder="例: 東京都渋谷区..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  担当医師名
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  placeholder="例: 田中 一郎"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  契約製品
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {products
                    .filter((p) => p.category === "external")
                    .map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-accent focus:ring-accent"
                        />
                        {p.name}
                      </label>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-light transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
