"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, Activity, AlertTriangle, ArrowRight, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const patients = [
  {
    id: "p1",
    name: "山田 太郎",
    age: 45,
    gender: "男性",
    conditions: ["高血圧", "2型糖尿病"],
    lastVisit: "2026-03-15",
    nextVisit: "2026-03-30",
    riskLevel: "moderate" as const,
    bp: "132/84",
    glucose: "118",
    adherence: 92,
  },
  {
    id: "p2",
    name: "田中 美咲",
    age: 62,
    gender: "女性",
    conditions: ["高血圧", "脂質異常症"],
    lastVisit: "2026-03-20",
    nextVisit: "2026-04-03",
    riskLevel: "high" as const,
    bp: "160/100",
    glucose: "95",
    adherence: 78,
  },
  {
    id: "p3",
    name: "鈴木 あゆみ",
    age: 28,
    gender: "女性",
    conditions: ["不眠症"],
    lastVisit: "2026-03-10",
    nextVisit: null,
    riskLevel: "low" as const,
    bp: "115/72",
    glucose: "-",
    adherence: 85,
  },
  {
    id: "p4",
    name: "高橋 次郎",
    age: 55,
    gender: "男性",
    conditions: ["高脂血症", "肥満"],
    lastVisit: "2026-03-22",
    nextVisit: "2026-04-05",
    riskLevel: "moderate" as const,
    bp: "128/80",
    glucose: "108",
    adherence: 88,
  },
  {
    id: "p5",
    name: "伊藤 真理",
    age: 38,
    gender: "女性",
    conditions: ["片頭痛"],
    lastVisit: "2026-03-25",
    nextVisit: null,
    riskLevel: "low" as const,
    bp: "118/74",
    glucose: "-",
    adherence: 95,
  },
];

const riskConfig = {
  low: { label: "低", class: "bg-green-100 text-green-700" },
  moderate: { label: "中", class: "bg-amber-100 text-amber-700" },
  high: { label: "高", class: "bg-red-100 text-red-700" },
};

export default function PatientsPage() {
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p) =>
    p.name.includes(search) || p.conditions.some((c) => c.includes(search))
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">患者一覧</h1>
        <p className="text-muted-foreground text-sm mt-1">担当患者の管理</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="氏名・疾患で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <User size={20} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{p.name}</p>
                    <span className="text-sm text-muted-foreground">{p.age}歳 {p.gender}</span>
                    <Badge className={riskConfig[p.riskLevel].class}>
                      リスク: {riskConfig[p.riskLevel].label}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mb-2">
                    {p.conditions.map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="block text-gray-400">血圧</span>
                      <span className="font-medium text-gray-700">{p.bp}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">血糖値</span>
                      <span className="font-medium text-gray-700">{p.glucose}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">服薬遵守率</span>
                      <span className={`font-medium ${p.adherence >= 90 ? "text-green-600" : p.adherence >= 80 ? "text-amber-600" : "text-red-600"}`}>
                        {p.adherence}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">次回予約</span>
                      <span className="font-medium text-gray-700">
                        {p.nextVisit ? new Date(p.nextVisit).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }) : "未設定"}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/doctor/patients/${p.id}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
