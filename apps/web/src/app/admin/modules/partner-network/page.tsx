"use client";

import {
  Network,
  FlaskConical,
  Pill,
  ArrowRightLeft,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import ModulePageLayout from "@/components/ModulePageLayout";

const partners = [
  {
    id: 1,
    name: "SRLラボラトリーズ",
    type: "検査機関",
    icon: <FlaskConical size={16} />,
    location: "東京都新宿区",
    status: "connected",
    tests: 1250,
    avgTurnaround: "1.2日",
  },
  {
    id: 2,
    name: "BMLクリニカル",
    type: "検査機関",
    icon: <FlaskConical size={16} />,
    location: "東京都渋谷区",
    status: "connected",
    tests: 890,
    avgTurnaround: "1.5日",
  },
  {
    id: 3,
    name: "ウエルシア薬局 渋谷店",
    type: "薬局",
    icon: <Pill size={16} />,
    location: "東京都渋谷区",
    status: "connected",
    tests: 0,
    avgTurnaround: "-",
  },
  {
    id: 4,
    name: "日本調剤 新宿店",
    type: "薬局",
    icon: <Pill size={16} />,
    location: "東京都新宿区",
    status: "connected",
    tests: 0,
    avgTurnaround: "-",
  },
  {
    id: 5,
    name: "スギ薬局 六本木店",
    type: "薬局",
    icon: <Pill size={16} />,
    location: "東京都港区",
    status: "pending",
    tests: 0,
    avgTurnaround: "-",
  },
];

const networkStats = [
  { label: "接続パートナー", value: "4", unit: "施設" },
  { label: "月間トランザクション", value: "5,600", unit: "件" },
  { label: "検査結果自動取込", value: "98.5", unit: "%" },
  { label: "処方箋送信成功率", value: "99.2", unit: "%" },
];

export default function PartnerNetworkPage() {
  return (
    <ModulePageLayout
      productId="partner-network"
      icon={<Network size={28} />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {networkStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-purple-50/50 rounded-xl p-4 text-center"
            >
              <p className="text-xl font-bold text-purple-700">
                {stat.value}
                <span className="text-xs font-normal text-gray-400 ml-1">
                  {stat.unit}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft size={18} className="text-purple-500" />
            <h3 className="font-medium">提携パートナー</h3>
          </div>
          <div className="space-y-2">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    partner.type === "検査機関"
                      ? "bg-blue-50 text-blue-500"
                      : "bg-green-50 text-green-500"
                  }`}
                >
                  {partner.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{partner.name}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        partner.type === "検査機関"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {partner.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin size={10} />
                    {partner.location}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {partner.status === "connected" ? (
                    <>
                      <CheckCircle2 size={14} className="text-success" />
                      <span className="text-xs font-medium text-success">
                        接続済
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-amber-500">
                      申請中
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
