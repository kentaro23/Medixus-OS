"use client";

import { Smartphone, Users, Download, Star, MessageSquare } from "lucide-react";
import ModulePageLayout from "@/components/ModulePageLayout";

const appMetrics = [
  { label: "累計ダウンロード", value: "8,420", icon: <Download size={16} /> },
  { label: "月間アクティブ", value: "5,230", icon: <Users size={16} /> },
  { label: "平均評価", value: "4.5", icon: <Star size={16} /> },
  { label: "フィードバック", value: "342件", icon: <MessageSquare size={16} /> },
];

const recentReviews = [
  {
    id: 1,
    user: "Y.T.",
    rating: 5,
    comment: "薬のリマインド機能がとても助かっています。飲み忘れがほぼゼロになりました。",
    date: "2026-10-28",
  },
  {
    id: 2,
    user: "M.K.",
    rating: 4,
    comment: "検査結果がすぐ見られるのがいい。ただ、グラフの表示がもう少し見やすいとありがたい。",
    date: "2026-10-25",
  },
  {
    id: 3,
    user: "S.N.",
    rating: 5,
    comment: "オンライン診療の予約がアプリから簡単にできて、仕事の合間に受診できるようになった。",
    date: "2026-10-22",
  },
  {
    id: 4,
    user: "H.A.",
    rating: 4,
    comment: "血圧の記録が自動で取り込まれるので、手入力の手間がなくなった。",
    date: "2026-10-20",
  },
];

export default function PatientAppPage() {
  return (
    <ModulePageLayout productId="patient-app" icon={<Smartphone size={28} />}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {appMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-amber-50/50 rounded-xl p-4 text-center"
            >
              <div className="flex justify-center mb-2 text-amber-500">
                {metric.icon}
              </div>
              <p className="text-xl font-bold text-amber-700">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{metric.label}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-medium mb-3">最近のユーザーレビュー</h3>
          <div className="space-y-3">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-700 text-xs font-bold">
                        {review.user}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.date).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
