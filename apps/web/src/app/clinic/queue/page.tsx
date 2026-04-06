"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, UserCheck, Clock, Bell, Coffee,
  CheckCircle2, XCircle, Stethoscope, RefreshCw,
  MessageSquare, ClipboardList, PhoneCall,
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
  consultation_start?: string;
  away_mode: boolean;
  away_notify_at_remaining?: number;
  estimated_wait_minutes: number;
  appointment_type: string;
  has_questionnaire: boolean;
  line_connected: boolean;
  is_first_visit: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  waiting:         { label: "待機中",  color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  called:          { label: "呼出済",  color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  in_consultation: { label: "診察中",  color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  completed:       { label: "完了",    color: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-200" },
  no_show:         { label: "不在",    color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200" },
};

const INITIAL_QUEUE: QueueEntry[] = [
  { id: "q1", patient_name: "山田 太郎", queue_number: 38, status: "completed", checked_in_at: "09:02", estimated_wait_minutes: 0, appointment_type: "再診", has_questionnaire: true, line_connected: true, away_mode: false, is_first_visit: false },
  { id: "q2", patient_name: "田中 花子", queue_number: 39, status: "completed", checked_in_at: "09:10", estimated_wait_minutes: 0, appointment_type: "初診", has_questionnaire: true, line_connected: false, away_mode: false, is_first_visit: true },
  { id: "q3", patient_name: "鈴木 次郎", queue_number: 40, status: "completed", checked_in_at: "09:15", estimated_wait_minutes: 0, appointment_type: "再診", has_questionnaire: true, line_connected: true, away_mode: false, is_first_visit: false },
  { id: "q4", patient_name: "高橋 美咲", queue_number: 41, status: "in_consultation", checked_in_at: "09:25", called_at: "10:05", consultation_start: "10:10", estimated_wait_minutes: 0, appointment_type: "再診", has_questionnaire: true, line_connected: true, away_mode: false, is_first_visit: false },
  { id: "q5", patient_name: "渡辺 健一", queue_number: 42, status: "called", checked_in_at: "09:30", called_at: "10:15", estimated_wait_minutes: 0, appointment_type: "初診", has_questionnaire: true, line_connected: false, away_mode: false, is_first_visit: true },
  { id: "q6", patient_name: "伊藤 雅子", queue_number: 43, status: "waiting", checked_in_at: "09:40", estimated_wait_minutes: 10, appointment_type: "再診", has_questionnaire: true, line_connected: true, away_mode: false, is_first_visit: false },
  { id: "q7", patient_name: "中村 大輔", queue_number: 44, status: "waiting", checked_in_at: "09:55", estimated_wait_minutes: 20, appointment_type: "初診", has_questionnaire: false, line_connected: true, away_mode: true, away_notify_at_remaining: 2, is_first_visit: true },
  { id: "q8", patient_name: "小林 由美", queue_number: 45, status: "waiting", checked_in_at: "10:05", estimated_wait_minutes: 30, appointment_type: "再診", has_questionnaire: true, line_connected: false, away_mode: false, is_first_visit: false },
];

function ElapsedTimer({ startTime }: { startTime?: string }) {
  const [elapsed, setElapsed] = useState("0:00");

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(
        startTime.includes(":") && !startTime.includes("T")
          ? `${new Date().toISOString().split("T")[0]}T${startTime}:00`
          : startTime
      ).getTime()) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${m}:${s.toString().padStart(2, "0")}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  return <span className="font-mono text-xs">{elapsed}</span>;
}

export default function QueueManagementPage() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const waitingCount = queue.filter((q) => q.status === "waiting").length;
  const calledEntry = queue.find((q) => q.status === "called");
  const inConsultation = queue.find((q) => q.status === "in_consultation");
  const currentNumber = calledEntry?.queue_number ?? inConsultation?.queue_number ?? 0;
  const completedCount = queue.filter((q) => q.status === "completed").length;
  const noShowCount = queue.filter((q) => q.status === "no_show").length;

  const refresh = useCallback(() => {
    // 本番では Supabase からリアルタイム取得
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(refresh, 30_000);
    } else {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    }
    return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current); };
  }, [autoRefresh, refresh]);

  function callNext() {
    setQueue((prev) => {
      const updated = [...prev];
      const currentCalled = updated.findIndex((q) => q.status === "called");
      if (currentCalled >= 0) {
        updated[currentCalled] = { ...updated[currentCalled], status: "in_consultation", consultation_start: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) };
      }
      const nextWaiting = updated.findIndex((q) => q.status === "waiting");
      if (nextWaiting >= 0) {
        updated[nextWaiting] = { ...updated[nextWaiting], status: "called", called_at: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) };
      }
      return updated;
    });
    setLastUpdated(new Date());
  }

  function recallPatient(id: string) {
    // 再呼出（LINEや音声で通知）
    console.log("再呼出:", id);
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
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">順番管理</h1>
          <p className="text-sm text-muted-foreground">
            リアルタイム来院患者管理・呼出システム
            {autoRefresh && (
              <span className="ml-2 text-xs text-green-600">
                ● 自動更新中 （{lastUpdated.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} 更新）
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setAutoRefresh((v) => !v); refresh(); }}
            className={autoRefresh ? "text-green-700 border-green-300 bg-green-50" : ""}
          >
            <RefreshCw size={14} className={`mr-1.5 ${autoRefresh ? "animate-spin [animation-duration:3s]" : ""}`} />
            {autoRefresh ? "自動更新ON" : "自動更新OFF"}
          </Button>
          <Button
            onClick={callNext}
            className="bg-cyan-600 hover:bg-cyan-700 h-10 px-5"
            disabled={waitingCount === 0}
          >
            <Bell size={16} className="mr-2" />
            次の患者を呼ぶ
            {waitingCount > 0 && (
              <span className="ml-2 bg-white text-cyan-700 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {waitingCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ステータスバー */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-cyan-300 bg-cyan-50/60 col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold text-cyan-700">{currentNumber || "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">現在の番号</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={14} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{waitingCount}</p>
            <p className="text-xs text-muted-foreground">待機中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Stethoscope size={14} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              {queue.filter((q) => q.status === "in_consultation").length}
            </p>
            <p className="text-xs text-muted-foreground">診察中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 size={14} className="text-gray-500" />
            </div>
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-muted-foreground">完了</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {waitingCount > 0 ? `約${waitingCount * 10}分` : "-"}
            </p>
            <p className="text-xs text-muted-foreground">最長待ち時間</p>
          </CardContent>
        </Card>
      </div>

      {/* 診察中バナー */}
      {inConsultation && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Stethoscope size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-900">
              診察中: <span className="text-lg">#{inConsultation.queue_number} {inConsultation.patient_name}</span>
            </p>
            <p className="text-sm text-green-700">
              開始: {inConsultation.consultation_start}
              {inConsultation.consultation_start && (
                <> · 経過: <ElapsedTimer startTime={inConsultation.consultation_start} /></>
              )}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-green-400 text-green-700"
            onClick={() => completeConsultation(inConsultation.id)}
          >
            <CheckCircle2 size={14} className="mr-1" /> 診察完了
          </Button>
        </div>
      )}

      {/* アクティブキュー */}
      <div className="space-y-2">
        {activeEntries.filter((e) => e.status !== "in_consultation").map((entry) => {
          const cfg = STATUS_CONFIG[entry.status];
          return (
            <Card key={entry.id} className={`${cfg.bg} ${cfg.border} border`}>
              <CardContent className="p-4 flex items-center gap-4">
                {/* 番号バッジ */}
                <div className={`w-14 h-14 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm shrink-0 ${
                  entry.status === "called" ? "ring-2 ring-orange-400" : ""
                }`}>
                  <span className="text-xl font-bold text-cyan-700 leading-none">{entry.queue_number}</span>
                  {entry.status === "called" && (
                    <span className="text-[9px] text-orange-500 font-medium mt-0.5">呼出中</span>
                  )}
                </div>

                {/* 患者情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold">{entry.patient_name}</span>
                    <Badge className={`${cfg.bg} ${cfg.color} ${cfg.border} border text-xs`}>{cfg.label}</Badge>
                    <Badge variant="outline" className="text-xs">{entry.appointment_type}</Badge>
                    {entry.is_first_visit && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">初診</Badge>
                    )}
                    {entry.line_connected && (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-300">LINE接続</Badge>
                    )}
                    {entry.away_mode && (
                      <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">
                        <Coffee size={10} className="mr-1" />外出中
                        {entry.away_notify_at_remaining && ` (${entry.away_notify_at_remaining}番前通知)`}
                      </Badge>
                    )}
                    {!entry.has_questionnaire && (
                      <Badge variant="destructive" className="text-xs">
                        <ClipboardList size={10} className="mr-1" />問診未回答
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    チェックイン: {entry.checked_in_at}
                    {entry.called_at && ` · 呼出: ${entry.called_at}`}
                    {entry.status === "waiting" && entry.estimated_wait_minutes > 0 && (
                      <> · <Clock size={10} className="inline mb-0.5" /> 約{entry.estimated_wait_minutes}分待ち</>
                    )}
                  </p>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-1.5 shrink-0">
                  {entry.status === "called" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-cyan-700 border-cyan-300"
                        onClick={() => recallPatient(entry.id)}
                      >
                        <PhoneCall size={12} className="mr-1" /> 再呼出
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-xs"
                        onClick={() => completeConsultation(entry.id)}
                      >
                        <Stethoscope size={12} className="mr-1" /> 診察開始
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-red-600 border-red-200"
                        onClick={() => markNoShow(entry.id)}
                      >
                        <XCircle size={12} className="mr-1" /> 不在
                      </Button>
                    </>
                  )}
                  {entry.status === "waiting" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-blue-700"
                      onClick={() => {
                        if (entry.line_connected) {
                          console.log("LINE通知:", entry.id);
                        }
                      }}
                    >
                      <MessageSquare size={12} className="mr-1" />
                      {entry.line_connected ? "LINE通知" : "案内"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {activeEntries.filter((e) => e.status !== "in_consultation").length === 0 && waitingCount === 0 && (
          <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
            <UserCheck size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">現在お待ちの患者はいません</p>
          </div>
        )}
      </div>

      {/* 完了・不在一覧 */}
      {completedEntries.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            完了 ({completedCount}件) · 不在 ({noShowCount}件)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {completedEntries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  entry.status === "no_show"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                <span className="font-bold w-7">{entry.queue_number}</span>
                <span className="flex-1 truncate text-xs">{entry.patient_name}</span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] shrink-0 ${entry.status === "no_show" ? "bg-red-100 text-red-600" : ""}`}
                >
                  {STATUS_CONFIG[entry.status].label}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
