"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquareHeart,
  AlertCircle,
  User,
  ChevronRight,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const consultations = [
  {
    id: "c1",
    patient: "山田 太郎",
    age: 45,
    gender: "男性",
    complaint: "頭痛（拍動性）",
    urgency: "normal" as const,
    summary: "2-3日前から拍動性頭痛。光過敏あり。高血圧・2型糖尿病で加療中。ペニシリンアレルギー。直近BP 132/84。",
    suggestedDiagnoses: ["片頭痛", "緊張型頭痛", "高血圧性頭痛"],
    suggestedTests: ["血液検査（CBC、CRP）", "頭部CT/MRI（必要時）"],
    reviewed: false,
    time: "09:45",
  },
  {
    id: "c2",
    patient: "田中 美咲",
    age: 62,
    gender: "女性",
    complaint: "胸痛・動悸",
    urgency: "semi_urgent" as const,
    summary: "今朝から胸部圧迫感と動悸。階段昇降時に増悪。高血圧で加療中。BP 160/100。HR 98。",
    suggestedDiagnoses: ["不安定狭心症", "心房細動", "高血圧性心疾患"],
    suggestedTests: ["心電図", "心エコー", "トロポニン"],
    reviewed: false,
    time: "10:10",
  },
  {
    id: "c3",
    patient: "鈴木 あゆみ",
    age: 28,
    gender: "女性",
    complaint: "不眠",
    urgency: "observation" as const,
    summary: "1週間前からの入眠困難。仕事のストレスあり。既往歴なし。服薬なし。",
    suggestedDiagnoses: ["不眠症", "適応障害"],
    suggestedTests: [],
    reviewed: false,
    time: "11:15",
  },
];

const urgencyConfig = {
  emergency: { label: "緊急", class: "bg-red-500 text-white" },
  semi_urgent: { label: "準緊急", class: "bg-orange-500 text-white" },
  normal: { label: "通常", class: "bg-blue-500 text-white" },
  observation: { label: "経過観察", class: "bg-green-500 text-white" },
};

export default function ConsultationsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const selectedData = consultations.find((c) => c.id === selected);

  function handleApprove(id: string) {
    setReviewedIds((prev) => new Set(prev).add(id));
    setSelected(null);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">AI問診確認</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AIによる問診結果を確認・承認してください
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <p>以下はAIの提案です。最終的な診断・治療方針の判断は先生が行ってください。</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {consultations.map((c) => {
            const reviewed = reviewedIds.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left p-4 border rounded-xl transition-colors ${
                  selected === c.id ? "border-teal-500 bg-teal-50" : "hover:bg-gray-50"
                } ${reviewed ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{c.patient}</span>
                    {reviewed && <CheckCircle2 size={14} className="text-green-500" />}
                  </div>
                  <Badge className={urgencyConfig[c.urgency].class}>
                    {urgencyConfig[c.urgency].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.complaint}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock size={10} /> {c.time}
                </p>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {selectedData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <CardTitle>{selectedData.patient}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedData.age}歳 {selectedData.gender}
                      </p>
                    </div>
                  </div>
                  <Badge className={urgencyConfig[selectedData.urgency].class}>
                    {urgencyConfig[selectedData.urgency].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">AI問診サマリー</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-xl">{selectedData.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm mb-2">推定疾患（AI）</h3>
                    <ul className="space-y-1">
                      {selectedData.suggestedDiagnoses.map((d) => (
                        <li key={d} className="text-sm flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <ChevronRight size={12} className="text-blue-500" /> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-2">推奨検査（AI）</h3>
                    {selectedData.suggestedTests.length > 0 ? (
                      <ul className="space-y-1">
                        {selectedData.suggestedTests.map((t) => (
                          <li key={t} className="text-sm flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                            <ChevronRight size={12} className="text-amber-500" /> {t}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">特になし</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">医師コメント</h3>
                  <textarea
                    className="w-full border rounded-xl p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    placeholder="所見・追加コメントを記入..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(selectedData.id)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    <CheckCircle2 size={16} className="mr-2" /> 確認・承認
                  </Button>
                  <Button variant="outline" className="flex-1">
                    修正して承認
                  </Button>
                  <Link href={`/doctor/prescriptions/new?patient=${selectedData.patient}`}>
                    <Button variant="outline">処方作成</Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <AlertCircle size={10} /> AIの提案です。最終判断は医師が行います。
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">左のリストから問診を選択してください</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
