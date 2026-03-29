"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Clock,
  ChevronRight,
  Bell,
  LogOut,
  Coffee,
  CheckCircle2,
  XCircle,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QueueEntry {
  id: string;
  patient_name: string;
  queue_number: number;
  status: "waiting" | "called" | "in_consultation" | "completed" | "no_show";
  checked_in_at: string;
  called_at?: string;
  away_mode: boolean;
  away_notify_at_remaining?: number;
  estimated_wait_minutes: number;
  appointment_type: string;
  has_questionnaire: boolean;
  line_connected: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  waiting: { label: "待機中", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  called: { label: "呼出済", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  in_consultation: { label: "診察中", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  completed: { label: "完了", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
  no_show: { label: "不在", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const DEMO_QUEUE: QueueEntry[] = [
  { id: "q1", patient_name: "山田 太郎", queue_number: 38, status: "completed", checked_in_at: "09:02", estimated_wait_minutes: 0, appointment_type: "再診", has_questionnaire: true, line_connected: true, away_mode: false },
  { id: "q2", patient_name: "田中 花子", queue_number: 39, status: "completed", checked_in_at: "09:10", estimated_wait_minutes: 0, appointment_type: "初診", has_questionnaire: true, line_connected: false, away_mode: false },
  { id: "q3", patient_name: "鈴木 次郎", queue_number: 40, status: "completed", checked_in_at: "09:15", estimated_wait_minutes: 0, appointment_type: "再診", has_questionnaire: true, line_connected: true, away_mode: false },
  { id: "q4", patient_name: "高橋 美咲", queue_number: 41, status: "in_consultation", checked_in_at: "09:25", called_at: "10:05", estimated_wait_minutes: 0, appointment_type: "再診", has_questionnaire: true, line_connected: true, away_mode: false },
  { id: "q5", patient_name: "渡辺 健一", queue_number: 42, status: "called", checked_in_at: "09:30", called_at: "10:15", estimated_wait_minutes: 0, appointment_type: "初診", has_questionnaire: true, line_connected: false, away_mode: false },
  { id: "q6", patient_name: "伊藤 雅子", queue_number: 43, status: "waiting", checked_in_at: "09:40", estimated_wait_minutes: 10, appointment_type: "再診", has_questionnaire: true, line_connected: true, away_mode: false },
  { id: "q7", patient_name: "中村 大輔", queue_number: 44, status: "waiting", checked_in_at: "09:55", estimated_wait_minutes: 20, appointment_type: "初診", has_questionnaire: false, line_connected: true, away_mode: true, away_notify_at_remaining: 2 },
  { id: "q8", patient_name: "小林 由美", queue_number: 45, status: "waiting", checked_in_at: "10:05", estimated_wait_minutes: 30, appointment_type: "再診", has_questionnaire: true, line_connected: false, away_mode: false },
];

export default function QueueManagementPage() {
  const [queue, setQueue] = useState(DEMO_QUEUE);
  const waitingCount = queue.filter((q) => q.status === "waiting").length;
  const currentNumber = queue.find((q) => q.status === "called")?.queue_number || queue.find((q) => q.status === "in_consultation")?.queue_number || 0;

  function callNext() {
    setQueue((prev) => {
      const updated = [...prev];
      const currentCalled = updated.findIndex((q) => q.status === "called");
      if (currentCalled >= 0) {
        updated[currentCalled] = { ...updated[currentCalled], status: "in_consultation" };
      }
      const nextWaiting = updated.findIndex((q) => q.status === "waiting");
      if (nextWaiting >= 0) {
        updated[nextWaiting] = { ...updated[nextWaiting], status: "called", called_at: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) };
      }
      return updated;
    });
  }

  function completeConsultation(id: string) {
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status: "completed" as const } : q));
  }

  function markNoShow(id: string) {
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status: "no_show" as const } : q));
  }

  const activeEntries = queue.filter((q) => q.status !== "completed" && q.status !== "no_show");
  const completedEntries = queue.filter((q) => q.status === "completed" || q.status === "no_show");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">順番管理</h1>
          <p className="text-sm text-muted-foreground">リアルタイム来院患者管理・呼出システム</p>
        </div>
        <Button onClick={callNext} className="bg-cyan-600 hover:bg-cyan-700 h-12 px-6" disabled={waitingCount === 0}>
          <Bell size={18} className="mr-2" /> 次の患者を呼ぶ
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="border-cyan-300 bg-cyan-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold text-cyan-700">{currentNumber || "-"}</p>
            <p className="text-xs text-muted-foreground">現在の番号</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{waitingCount}</p>
            <p className="text-xs text-muted-foreground">お待ちの方</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{queue.filter((q) => q.status === "in_consultation").length}</p>
            <p className="text-xs text-muted-foreground">診察中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{completedEntries.length}</p>
            <p className="text-xs text-muted-foreground">完了</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {activeEntries.map((entry) => {
          const cfg = STATUS_CONFIG[entry.status];
          return (
            <Card key={entry.id} className={`${cfg.bg} border`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-xl font-bold text-cyan-700">{entry.queue_number}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.patient_name}</span>
                    <Badge className={cfg.bg + " " + cfg.color + " border"}>{cfg.label}</Badge>
                    <Badge variant="outline" className="text-xs">{entry.appointment_type}</Badge>
                    {entry.line_connected && <Badge variant="outline" className="text-xs text-green-700 border-green-300">LINE</Badge>}
                    {entry.away_mode && <Badge variant="outline" className="text-xs text-orange-700 border-orange-300"><Coffee size={10} className="mr-1" />外出中</Badge>}
                    {!entry.has_questionnaire && <Badge variant="destructive" className="text-xs">問診未回答</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    チェックイン: {entry.checked_in_at}
                    {entry.called_at && ` | 呼出: ${entry.called_at}`}
                    {entry.status === "waiting" && ` | 予想待ち: 約${entry.estimated_wait_minutes}分`}
                  </p>
                </div>
                <div className="flex gap-1">
                  {entry.status === "called" && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs" onClick={() => completeConsultation(entry.id)}>
                        <Stethoscope size={12} className="mr-1" /> 診察開始
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs text-red-600" onClick={() => markNoShow(entry.id)}>
                        <XCircle size={12} className="mr-1" /> 不在
                      </Button>
                    </>
                  )}
                  {entry.status === "in_consultation" && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => completeConsultation(entry.id)}>
                      <CheckCircle2 size={12} className="mr-1" /> 完了
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {completedEntries.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">完了 ({completedEntries.length})</h2>
          <div className="space-y-1">
            {completedEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg text-sm opacity-60">
                <span className="font-bold text-gray-400 w-8">{entry.queue_number}</span>
                <span>{entry.patient_name}</span>
                <Badge variant="secondary" className="text-xs">{STATUS_CONFIG[entry.status].label}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
