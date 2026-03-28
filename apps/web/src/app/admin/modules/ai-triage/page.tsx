"use client";

import { Brain, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import ModulePageLayout from "@/components/ModulePageLayout";

const recentTriages = [
  {
    id: 1,
    patient: "A.T. (48歳・男性)",
    chief: "頭痛・めまい",
    risk: "中",
    result: "高血圧疑い → 血圧測定+血液検査推奨",
    time: "3分前",
  },
  {
    id: 2,
    patient: "K.S. (62歳・女性)",
    chief: "動悸・息切れ",
    risk: "高",
    result: "不整脈疑い → 心電図+ホルター推奨",
    time: "12分前",
  },
  {
    id: 3,
    patient: "M.Y. (35歳・男性)",
    chief: "喉の痛み・発熱",
    risk: "低",
    result: "上気道感染 → 対症療法",
    time: "25分前",
  },
  {
    id: 4,
    patient: "R.N. (55歳・女性)",
    chief: "多飲多尿・体重減少",
    risk: "高",
    result: "糖尿病悪化 → HbA1c+尿検査推奨",
    time: "40分前",
  },
  {
    id: 5,
    patient: "H.I. (42歳・男性)",
    chief: "腰痛",
    risk: "低",
    result: "筋筋膜性腰痛 → NSAIDs+リハ推奨",
    time: "1時間前",
  },
];

export default function AiTriagePage() {
  return (
    <ModulePageLayout productId="ai-triage" icon={<Brain size={28} />}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={18} className="text-indigo-500" />
          <h3 className="font-medium">直近のAI問診結果</h3>
        </div>
        <div className="space-y-2">
          {recentTriages.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  t.risk === "高"
                    ? "bg-red-50"
                    : t.risk === "中"
                    ? "bg-amber-50"
                    : "bg-green-50"
                }`}
              >
                {t.risk === "高" ? (
                  <AlertTriangle size={18} className="text-red-500" />
                ) : t.risk === "中" ? (
                  <AlertTriangle size={18} className="text-amber-500" />
                ) : (
                  <CheckCircle size={18} className="text-green-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{t.patient}</p>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      t.risk === "高"
                        ? "bg-red-100 text-red-700"
                        : t.risk === "中"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    リスク: {t.risk}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  主訴: {t.chief}
                </p>
                <p className="text-xs text-gray-600 mt-1">{t.result}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {t.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ModulePageLayout>
  );
}
