"use client";

import {
  Video,
  Calendar,
  Clock,
  User,
  CircleDot,
} from "lucide-react";
import ModulePageLayout from "@/components/ModulePageLayout";

const upcomingSessions = [
  {
    id: 1,
    patient: "佐々木 正雄",
    doctor: "田中 一郎",
    clinic: "田中内科クリニック",
    time: "14:00",
    type: "再診",
    status: "waiting",
  },
  {
    id: 2,
    patient: "木村 花",
    doctor: "山本 健太",
    clinic: "山本糖尿病・代謝クリニック",
    time: "14:15",
    type: "再診",
    status: "in-progress",
  },
  {
    id: 3,
    patient: "清水 太郎",
    doctor: "中村 美咲",
    clinic: "中村総合クリニック",
    time: "14:30",
    type: "再診",
    status: "scheduled",
  },
  {
    id: 4,
    patient: "小川 敏子",
    doctor: "田中 一郎",
    clinic: "田中内科クリニック",
    time: "14:45",
    type: "再診",
    status: "scheduled",
  },
  {
    id: 5,
    patient: "藤田 勇",
    doctor: "加藤 隆",
    clinic: "加藤内科循環器クリニック",
    time: "15:00",
    type: "再診",
    status: "scheduled",
  },
];

const statusStyles: Record<string, { label: string; dot: string; bg: string }> = {
  "in-progress": { label: "診察中", dot: "bg-green-500", bg: "bg-green-50" },
  waiting: { label: "待機中", dot: "bg-amber-500", bg: "bg-amber-50" },
  scheduled: { label: "予定", dot: "bg-blue-500", bg: "bg-blue-50" },
};

export default function OnlineConsultationPage() {
  return (
    <ModulePageLayout
      productId="online-consultation"
      icon={<Video size={28} />}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={18} className="text-cyan-500" />
          <h3 className="font-medium">本日のオンライン診療スケジュール</h3>
        </div>
        <div className="space-y-2">
          {upcomingSessions.map((s) => {
            const style = statusStyles[s.status];
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  s.status === "in-progress"
                    ? "border-green-200 bg-green-50/30"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="text-center min-w-[50px]">
                  <p className="text-lg font-bold text-gray-700">{s.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <p className="text-sm font-semibold">{s.patient}</p>
                    <span className="text-xs bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-medium">
                      {s.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.doctor} · {s.clinic}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CircleDot
                    size={12}
                    className={`${
                      s.status === "in-progress"
                        ? "text-green-500 animate-pulse-dot"
                        : s.status === "waiting"
                        ? "text-amber-500"
                        : "text-blue-400"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {style.label}
                  </span>
                </div>
                {s.status === "in-progress" && (
                  <button className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors">
                    参加
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ModulePageLayout>
  );
}
