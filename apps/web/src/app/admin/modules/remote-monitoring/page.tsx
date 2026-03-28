"use client";

import { Activity, AlertTriangle, Heart, Droplets, Weight } from "lucide-react";
import ModulePageLayout from "@/components/ModulePageLayout";

const activeAlerts = [
  {
    id: 1,
    patient: "田中 裕子 (67歳)",
    clinic: "山本糖尿病・代謝クリニック",
    type: "血圧",
    value: "182/102 mmHg",
    threshold: "140/90",
    severity: "high",
    time: "10分前",
    icon: <Heart size={16} />,
  },
  {
    id: 2,
    patient: "山田 健一 (54歳)",
    clinic: "田中内科クリニック",
    type: "血糖値",
    value: "285 mg/dL",
    threshold: "180",
    severity: "high",
    time: "25分前",
    icon: <Droplets size={16} />,
  },
  {
    id: 3,
    patient: "佐藤 美由紀 (45歳)",
    clinic: "加藤内科循環器クリニック",
    type: "体重",
    value: "+2.3kg/週",
    threshold: "+1.5kg/週",
    severity: "medium",
    time: "1時間前",
    icon: <Weight size={16} />,
  },
  {
    id: 4,
    patient: "伊藤 正男 (72歳)",
    clinic: "高橋生活習慣病クリニック",
    type: "心拍数",
    value: "112 bpm",
    threshold: "100",
    severity: "medium",
    time: "2時間前",
    icon: <Heart size={16} />,
  },
];

const monitoringStats = [
  { label: "接続デバイス", value: "2,340", change: "+180" },
  { label: "今日のデータポイント", value: "45,280", change: "+5,120" },
  { label: "アクティブアラート", value: "12", change: "-3" },
  { label: "対応済み", value: "8", change: "+2" },
];

export default function RemoteMonitoringPage() {
  return (
    <ModulePageLayout
      productId="remote-monitoring"
      icon={<Activity size={28} />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {monitoringStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-emerald-50/50 rounded-xl p-3 text-center"
            >
              <p className="text-xl font-bold text-emerald-700">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-medium">アクティブアラート</h3>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  alert.severity === "high"
                    ? "border-red-200 bg-red-50/30"
                    : "border-amber-200 bg-amber-50/30"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === "high" ? "bg-red-100" : "bg-amber-100"
                  }`}
                >
                  <span
                    className={
                      alert.severity === "high"
                        ? "text-red-500"
                        : "text-amber-500"
                    }
                  >
                    {alert.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{alert.patient}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        alert.severity === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {alert.clinic}
                  </p>
                  <p className="text-xs mt-1">
                    <span className="font-semibold text-gray-700">
                      {alert.value}
                    </span>
                    <span className="text-gray-400 ml-2">
                      (基準値: {alert.threshold})
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400">{alert.time}</span>
                  <button className="px-3 py-1 bg-white border border-gray-200 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    対応する
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
