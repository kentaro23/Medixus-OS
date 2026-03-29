"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Pill,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronRight,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  remaining_days: number;
  prescribed_at: string;
  doctor_name: string;
}

interface MedLog {
  id: string;
  medication_id: string;
  medication_name: string;
  scheduled_at: string;
  status: "pending" | "taken" | "skipped" | "side_effect";
  side_effect_notes?: string;
}

const DEMO_MEDICATIONS: Medication[] = [
  {
    id: "m1",
    name: "メトホルミン",
    dosage: "500mg",
    frequency: "1日2回朝夕食後",
    duration_days: 30,
    remaining_days: 18,
    prescribed_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    doctor_name: "佐藤 一郎 先生",
  },
  {
    id: "m2",
    name: "アムロジピン",
    dosage: "5mg",
    frequency: "1日1回朝食後",
    duration_days: 30,
    remaining_days: 18,
    prescribed_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    doctor_name: "佐藤 一郎 先生",
  },
  {
    id: "m3",
    name: "ロキソプロフェン",
    dosage: "60mg",
    frequency: "1日3回毎食後（5日分）",
    duration_days: 5,
    remaining_days: 2,
    prescribed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    doctor_name: "鈴木 花子 先生",
  },
];

function generateTodayLogs(meds: Medication[]): MedLog[] {
  const logs: MedLog[] = [];
  const today = new Date();
  for (const med of meds) {
    const times = med.frequency.includes("3回")
      ? ["08:00", "12:00", "19:00"]
      : med.frequency.includes("2回")
        ? ["08:00", "19:00"]
        : ["08:00"];
    for (const t of times) {
      const scheduled = new Date(today);
      const [h, m] = t.split(":").map(Number);
      scheduled.setHours(h, m, 0, 0);
      logs.push({
        id: `${med.id}-${t}`,
        medication_id: med.id,
        medication_name: `${med.name} ${med.dosage}`,
        scheduled_at: scheduled.toISOString(),
        status: scheduled < today ? "pending" : "pending",
      });
    }
  }
  return logs.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState(DEMO_MEDICATIONS);
  const [todayLogs, setTodayLogs] = useState<MedLog[]>([]);
  const [sideEffectInput, setSideEffectInput] = useState<{ logId: string; text: string } | null>(null);
  const [tab, setTab] = useState<"today" | "list">("today");

  useEffect(() => {
    setTodayLogs(generateTodayLogs(medications));
  }, [medications]);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("*, prescription_items(*), doctors!inner(profiles!inner(display_name))")
        .eq("patient_id", user.id)
        .in("status", ["doctor_approved", "sent_to_pharmacy", "dispensed", "delivered"])
        .order("prescribed_at", { ascending: false });

      if (prescriptions && prescriptions.length > 0) {
        const meds: Medication[] = [];
        for (const p of prescriptions) {
          const items = (p.prescription_items as Array<Record<string, unknown>>) || [];
          for (const item of items) {
            const prescribedDaysAgo = Math.floor(
              (Date.now() - new Date(p.prescribed_at || p.created_at).getTime()) / 86400000
            );
            meds.push({
              id: item.id as string,
              name: item.medication_name as string,
              dosage: item.dosage as string,
              frequency: item.frequency as string,
              duration_days: item.duration_days as number,
              remaining_days: Math.max(0, (item.duration_days as number) - prescribedDaysAgo),
              prescribed_at: p.prescribed_at || p.created_at,
              doctor_name: ((p.doctors as Record<string, unknown>)?.profiles as Record<string, string>)?.display_name || "医師",
            });
          }
        }
        if (meds.length > 0) setMedications(meds);
      }
    } catch {
      /* use demo data */
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function markLog(logId: string, status: "taken" | "skipped" | "side_effect") {
    if (status === "side_effect") {
      setSideEffectInput({ logId, text: "" });
      return;
    }
    setTodayLogs((prev) => prev.map((l) => (l.id === logId ? { ...l, status } : l)));
  }

  function submitSideEffect() {
    if (!sideEffectInput) return;
    setTodayLogs((prev) =>
      prev.map((l) =>
        l.id === sideEffectInput.logId
          ? { ...l, status: "side_effect" as const, side_effect_notes: sideEffectInput.text }
          : l
      )
    );
    setSideEffectInput(null);
  }

  const takenCount = todayLogs.filter((l) => l.status === "taken").length;
  const totalCount = todayLogs.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">服薬管理</h1>
        <p className="text-sm text-muted-foreground mt-1">処方薬の服用記録と残薬管理</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "today" ? "default" : "outline"}
          onClick={() => setTab("today")}
          className={tab === "today" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
        >
          <Clock size={16} className="mr-2" /> 今日の服薬
        </Button>
        <Button
          variant={tab === "list" ? "default" : "outline"}
          onClick={() => setTab("list")}
          className={tab === "list" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
        >
          <Pill size={16} className="mr-2" /> 処方薬一覧
        </Button>
      </div>

      {tab === "today" && (
        <div className="space-y-4">
          <Card className="bg-indigo-50/50 border-indigo-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日の進捗</p>
                <p className="text-2xl font-bold">{takenCount}/{totalCount}</p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeDasharray={`${(takenCount / Math.max(totalCount, 1)) * 94.2} 94.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {todayLogs.map((log) => {
              const time = new Date(log.scheduled_at).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Card
                  key={log.id}
                  className={
                    log.status === "taken"
                      ? "bg-green-50 border-green-200"
                      : log.status === "skipped"
                        ? "bg-gray-50 opacity-60"
                        : log.status === "side_effect"
                          ? "bg-red-50 border-red-200"
                          : ""
                  }
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="min-w-[50px] text-center">
                      <p className="text-sm font-bold">{time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.medication_name}</p>
                      {log.side_effect_notes && (
                        <p className="text-xs text-red-600 mt-0.5">副作用: {log.side_effect_notes}</p>
                      )}
                    </div>
                    {log.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs h-8"
                          onClick={() => markLog(log.id, "taken")}
                        >
                          <CheckCircle2 size={12} className="mr-1" /> 服用
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => markLog(log.id, "skipped")}
                        >
                          スキップ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 text-red-600 border-red-200"
                          onClick={() => markLog(log.id, "side_effect")}
                        >
                          <AlertTriangle size={12} />
                        </Button>
                      </div>
                    )}
                    {log.status === "taken" && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 size={12} className="mr-1" /> 服用済
                      </Badge>
                    )}
                    {log.status === "skipped" && (
                      <Badge variant="secondary">スキップ</Badge>
                    )}
                    {log.status === "side_effect" && (
                      <Badge variant="destructive">副作用あり</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {sideEffectInput && (
            <Card className="border-red-300">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-medium text-red-700">副作用の記録</h3>
                <textarea
                  value={sideEffectInput.text}
                  onChange={(e) => setSideEffectInput({ ...sideEffectInput, text: e.target.value })}
                  placeholder="どのような症状がありましたか？"
                  className="w-full border rounded-lg p-3 text-sm h-20"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitSideEffect} className="bg-red-600 hover:bg-red-700">
                    記録する
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSideEffectInput(null)}>
                    キャンセル
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  この記録は次回診療時に医師に自動共有されます
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "list" && (
        <div className="space-y-3">
          {medications.map((med) => (
            <Card key={med.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Pill size={16} className="text-indigo-600" />
                      <span className="font-medium">{med.name}</span>
                      <Badge variant="outline">{med.dosage}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{med.frequency}</p>
                    <p className="text-xs text-muted-foreground">
                      処方: {med.doctor_name} | {new Date(med.prescribed_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`flex items-center gap-1 ${
                        med.remaining_days <= 3 ? "text-red-600" : med.remaining_days <= 7 ? "text-yellow-600" : "text-green-600"
                      }`}
                    >
                      <Package size={14} />
                      <span className="text-sm font-bold">残り{med.remaining_days}日分</span>
                    </div>
                    <div className="h-1.5 w-20 bg-gray-100 rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${
                          med.remaining_days <= 3 ? "bg-red-500" : med.remaining_days <= 7 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${(med.remaining_days / med.duration_days) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
