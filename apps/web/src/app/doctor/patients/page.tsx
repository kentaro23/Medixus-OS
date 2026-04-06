"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, User, Activity, AlertTriangle, ArrowRight,
  SortAsc, SortDesc, Filter, TrendingUp, TrendingDown,
  Minus, Calendar, ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PATIENTS = [
  {
    id: "p1", name: "山田 太郎", nameKana: "ヤマダ タロウ", age: 45, gender: "男性",
    conditions: ["高血圧", "2型糖尿病"],
    lastVisit: "2026-03-15", nextVisit: "2026-04-10",
    riskLevel: "moderate" as const,
    bp: "132/84", bpTrend: "down" as const,
    glucose: "118", glucoseTrend: "stable" as const,
    adherence: 92,
    alerts: 1,
  },
  {
    id: "p2", name: "田中 美咲", nameKana: "タナカ ミサキ", age: 62, gender: "女性",
    conditions: ["高血圧", "脂質異常症"],
    lastVisit: "2026-03-20", nextVisit: "2026-04-03",
    riskLevel: "high" as const,
    bp: "160/100", bpTrend: "up" as const,
    glucose: "95", glucoseTrend: "stable" as const,
    adherence: 78,
    alerts: 2,
  },
  {
    id: "p3", name: "鈴木 あゆみ", nameKana: "スズキ アユミ", age: 28, gender: "女性",
    conditions: ["不眠症"],
    lastVisit: "2026-03-10", nextVisit: null,
    riskLevel: "low" as const,
    bp: "115/72", bpTrend: "stable" as const,
    glucose: "-", glucoseTrend: "stable" as const,
    adherence: 85,
    alerts: 0,
  },
  {
    id: "p4", name: "高橋 次郎", nameKana: "タカハシ ジロウ", age: 55, gender: "男性",
    conditions: ["高脂血症", "肥満"],
    lastVisit: "2026-03-22", nextVisit: "2026-04-05",
    riskLevel: "moderate" as const,
    bp: "128/80", bpTrend: "down" as const,
    glucose: "108", glucoseTrend: "down" as const,
    adherence: 88,
    alerts: 0,
  },
  {
    id: "p5", name: "伊藤 真理", nameKana: "イトウ マリ", age: 38, gender: "女性",
    conditions: ["片頭痛"],
    lastVisit: "2026-03-25", nextVisit: null,
    riskLevel: "low" as const,
    bp: "118/74", bpTrend: "stable" as const,
    glucose: "-", glucoseTrend: "stable" as const,
    adherence: 95,
    alerts: 0,
  },
  {
    id: "p6", name: "中村 健介", nameKana: "ナカムラ ケンスケ", age: 70, gender: "男性",
    conditions: ["慢性心不全", "高血圧", "慢性腎臓病"],
    lastVisit: "2026-03-28", nextVisit: "2026-04-04",
    riskLevel: "high" as const,
    bp: "148/92", bpTrend: "up" as const,
    glucose: "135", glucoseTrend: "up" as const,
    adherence: 70,
    alerts: 3,
  },
];

const RISK_CONFIG = {
  low:      { label: "低リスク", shortLabel: "低", textClass: "text-green-700", bgClass: "bg-green-100" },
  moderate: { label: "中リスク", shortLabel: "中", textClass: "text-amber-700", bgClass: "bg-amber-100" },
  high:     { label: "高リスク", shortLabel: "高", textClass: "text-red-700",   bgClass: "bg-red-100"   },
};

type SortField = "name" | "age" | "risk" | "adherence" | "lastVisit" | "alerts";
type RiskFilter = "all" | "low" | "moderate" | "high";

const RISK_ORDER = { low: 0, moderate: 1, high: 2 };

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp size={12} className="text-red-500" />;
  if (trend === "down") return <TrendingDown size={12} className="text-green-500" />;
  return <Minus size={12} className="text-gray-400" />;
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [sortField, setSortField] = useState<SortField>("alerts");
  const [sortAsc, setSortAsc] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const stats = useMemo(() => ({
    total: PATIENTS.length,
    high: PATIENTS.filter((p) => p.riskLevel === "high").length,
    alerts: PATIENTS.reduce((s, p) => s + p.alerts, 0),
    lowAdherence: PATIENTS.filter((p) => p.adherence < 80).length,
  }), []);

  const filtered = useMemo(() => {
    let list = [...PATIENTS];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.includes(search) ||
        p.nameKana.includes(search.toUpperCase()) ||
        p.conditions.some((c) => c.includes(search))
      );
      void q;
    }

    if (riskFilter !== "all") {
      list = list.filter((p) => p.riskLevel === riskFilter);
    }

    list.sort((a, b) => {
      let diff = 0;
      switch (sortField) {
        case "name":       diff = a.name.localeCompare(b.name, "ja"); break;
        case "age":        diff = a.age - b.age; break;
        case "risk":       diff = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]; break;
        case "adherence":  diff = a.adherence - b.adherence; break;
        case "lastVisit":  diff = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime(); break;
        case "alerts":     diff = a.alerts - b.alerts; break;
      }
      return sortAsc ? diff : -diff;
    });

    return list;
  }, [search, riskFilter, sortField, sortAsc]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc((v) => !v);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  function SortButton({ field, children }: { field: SortField; children: React.ReactNode }) {
    const active = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className={`flex items-center gap-1 text-xs font-medium transition-colors ${active ? "text-teal-700" : "text-gray-500 hover:text-gray-700"}`}
      >
        {children}
        {active ? (sortAsc ? <SortAsc size={12} /> : <SortDesc size={12} />) : <ChevronDown size={12} className="opacity-40" />}
      </button>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">患者一覧</h1>
        <p className="text-muted-foreground text-sm mt-1">担当患者の健康状態・アラート管理</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">担当患者</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.high}</p>
          <p className="text-xs text-muted-foreground">高リスク</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{stats.alerts}</p>
          <p className="text-xs text-muted-foreground">未対応アラート</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-700">{stats.lowAdherence}</p>
          <p className="text-xs text-muted-foreground">服薬遵守率低下</p>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="氏名・カナ・疾患で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className={showFilters ? "border-teal-400 text-teal-700 bg-teal-50" : ""}
          >
            <Filter size={14} className="mr-1" /> フィルター
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border">
            <span className="text-xs text-gray-500 self-center mr-1">リスク:</span>
            {(["all", "high", "moderate", "low"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  riskFilter === r
                    ? r === "all" ? "bg-gray-800 text-white border-gray-800"
                      : r === "high" ? "bg-red-600 text-white border-red-600"
                      : r === "moderate" ? "bg-amber-500 text-white border-amber-500"
                      : "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {r === "all" ? "すべて" : RISK_CONFIG[r].label}
                {r !== "all" && (
                  <span className="ml-1 opacity-70">
                    ({PATIENTS.filter((p) => p.riskLevel === r).length})
                  </span>
                )}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              <span>並び替え:</span>
              <SortButton field="alerts">アラート</SortButton>
              <SortButton field="risk">リスク</SortButton>
              <SortButton field="adherence">服薬率</SortButton>
              <SortButton field="lastVisit">最終受診</SortButton>
            </div>
          </div>
        )}
      </div>

      {/* 件数 */}
      <p className="text-xs text-muted-foreground">
        {filtered.length}件表示 {search || riskFilter !== "all" ? `（絞り込み中）` : ""}
      </p>

      {/* 患者リスト */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p>該当する患者が見つかりません</p>
          </div>
        )}
        {filtered.map((p) => {
          const risk = RISK_CONFIG[p.riskLevel];
          return (
            <Card key={p.id} className={`hover:shadow-md transition-shadow ${p.riskLevel === "high" ? "border-red-200" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* アバター */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    p.riskLevel === "high" ? "bg-red-100" :
                    p.riskLevel === "moderate" ? "bg-amber-100" : "bg-green-100"
                  }`}>
                    <User size={20} className={risk.textClass} />
                  </div>

                  {/* 基本情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold">{p.name}</p>
                      <span className="text-sm text-muted-foreground">{p.age}歳 {p.gender}</span>
                      <Badge className={`${risk.bgClass} ${risk.textClass} text-xs`}>
                        {p.riskLevel === "high" && <AlertTriangle size={10} className="mr-1" />}
                        {risk.shortLabel}リスク
                      </Badge>
                      {p.alerts > 0 && (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          ⚠ {p.alerts}件のアラート
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {p.conditions.map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>

                    {/* バイタルと服薬 */}
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="block text-gray-400 mb-0.5">血圧</span>
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold ${p.bpTrend === "up" ? "text-red-700" : "text-gray-700"}`}>
                            {p.bp}
                          </span>
                          <TrendIcon trend={p.bpTrend} />
                        </div>
                      </div>
                      <div>
                        <span className="block text-gray-400 mb-0.5">血糖値</span>
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold ${p.glucoseTrend === "up" ? "text-amber-700" : "text-gray-700"}`}>
                            {p.glucose}
                          </span>
                          {p.glucose !== "-" && <TrendIcon trend={p.glucoseTrend} />}
                        </div>
                      </div>
                      <div>
                        <span className="block text-gray-400 mb-0.5">服薬遵守率</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${
                            p.adherence >= 90 ? "text-green-600" :
                            p.adherence >= 80 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {p.adherence}%
                          </span>
                          <div className="flex-1 max-w-[40px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.adherence >= 90 ? "bg-green-500" :
                                p.adherence >= 80 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${p.adherence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="block text-gray-400 mb-0.5">次回予約</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={10} className="text-gray-400" />
                          <span className="font-semibold text-gray-700">
                            {p.nextVisit
                              ? new Date(p.nextVisit).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
                              : <span className="text-gray-400">未設定</span>
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* アクション */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Link href={`/doctor/patients/${p.id}`}>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        カルテ <ArrowRight size={12} className="ml-1" />
                      </Button>
                    </Link>
                    <Link href={`/doctor/patients/${p.id}/consultation`}>
                      <Button size="sm" className="w-full text-xs bg-teal-600 hover:bg-teal-700">
                        問診確認
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
