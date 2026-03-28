"use client";

import { useState } from "react";
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MedLog {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: "taken" | "missed" | "pending" | "side_effect";
  takenAt?: string;
  sideEffect?: string;
}

const todayLogs: MedLog[] = [
  { id: "1", name: "メトホルミン", dosage: "500mg", time: "08:00", status: "taken", takenAt: "08:05" },
  { id: "2", name: "アムロジピン", dosage: "5mg", time: "08:00", status: "taken", takenAt: "08:05" },
  { id: "3", name: "メトホルミン", dosage: "500mg", time: "20:00", status: "pending" },
];

const medications = [
  {
    name: "メトホルミン",
    dosage: "500mg",
    frequency: "1日2回 朝夕食後",
    remaining: 22,
    totalDays: 30,
    prescriber: "佐藤 一郎",
    purpose: "2型糖尿病",
  },
  {
    name: "アムロジピン",
    dosage: "5mg",
    frequency: "1日1回 朝食後",
    remaining: 22,
    totalDays: 30,
    prescriber: "佐藤 一郎",
    purpose: "高血圧",
  },
];

const weeklyAdherence = [
  { day: "月", rate: 100 },
  { day: "火", rate: 100 },
  { day: "水", rate: 75 },
  { day: "木", rate: 100 },
  { day: "金", rate: 100 },
  { day: "土", rate: 50 },
  { day: "日", rate: 100 },
];

const statusConfig = {
  taken: { label: "服用済み", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  missed: { label: "未服用", icon: AlertTriangle, color: "text-red-600 bg-red-50" },
  pending: { label: "予定", icon: Clock, color: "text-amber-600 bg-amber-50" },
  side_effect: { label: "副作用あり", icon: AlertTriangle, color: "text-purple-600 bg-purple-50" },
};

export default function MedicationsPage() {
  const [logs, setLogs] = useState(todayLogs);

  function markAsTaken(id: string) {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: "taken" as const, takenAt: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) }
          : l
      )
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">服薬管理</h1>
        <p className="text-muted-foreground text-sm mt-1">服薬記録・残薬管理・服薬アドヒアランス</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">今日の服薬スケジュール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.map((log) => {
            const st = statusConfig[log.status];
            return (
              <div key={log.id} className="flex items-center gap-4 p-3 border rounded-xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${st.color}`}>
                  <st.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{log.name} {log.dosage}</p>
                  <p className="text-xs text-muted-foreground">
                    予定: {log.time}
                    {log.takenAt && ` → 服用: ${log.takenAt}`}
                  </p>
                </div>
                <Badge className={st.color}>{st.label}</Badge>
                {log.status === "pending" && (
                  <Button size="sm" onClick={() => markAsTaken(log.id)} className="bg-indigo-600 hover:bg-indigo-700">
                    服用済み
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">週間アドヒアランス</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-32">
            {weeklyAdherence.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-muted-foreground">{d.rate}%</span>
                <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: "80px" }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t-md transition-all ${
                      d.rate >= 100 ? "bg-green-500" : d.rate >= 75 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ height: `${d.rate * 0.8}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {medications.map((med) => (
          <Card key={med.name} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Pill size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{med.name} {med.dosage}</p>
                    <p className="text-xs text-muted-foreground">{med.frequency}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">処方目的</span>
                  <span>{med.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">処方医</span>
                  <span>{med.prescriber} 先生</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">残薬</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${med.remaining > 7 ? "bg-green-500" : "bg-amber-500"}`}
                        style={{ width: `${(med.remaining / med.totalDays) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold">{med.remaining}日分</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
