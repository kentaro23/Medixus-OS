"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Video,
  MapPin,
  MessageSquare,
  Pill,
  FileText,
  AlertCircle,
  Search,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface TodayAppointment {
  id: string;
  patient_name: string;
  patient_id: string;
  appointment_type: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  has_consultation: boolean;
}

interface PendingTask {
  type: string;
  label: string;
  count: number;
  icon: typeof MessageSquare;
  href: string;
  color: string;
}

interface MonthlyStats {
  total_consultations: number;
  online_rate: number;
  retention_rate: number;
  avg_duration: number;
}

const DEMO_APPOINTMENTS: TodayAppointment[] = [
  { id: "1", patient_name: "山田 太郎", patient_id: "p1", appointment_type: "online_followup", status: "scheduled", scheduled_at: `${new Date().toISOString().split("T")[0]}T09:00:00`, duration_minutes: 15, has_consultation: true },
  { id: "2", patient_name: "田中 花子", patient_id: "p2", appointment_type: "online_initial", status: "scheduled", scheduled_at: `${new Date().toISOString().split("T")[0]}T09:30:00`, duration_minutes: 30, has_consultation: true },
  { id: "3", patient_name: "鈴木 次郎", patient_id: "p3", appointment_type: "in_person_followup", status: "completed", scheduled_at: `${new Date().toISOString().split("T")[0]}T10:00:00`, duration_minutes: 15, has_consultation: false },
  { id: "4", patient_name: "高橋 美咲", patient_id: "p4", appointment_type: "online_followup", status: "scheduled", scheduled_at: `${new Date().toISOString().split("T")[0]}T10:30:00`, duration_minutes: 15, has_consultation: true },
  { id: "5", patient_name: "渡辺 健一", patient_id: "p5", appointment_type: "pre_consultation", status: "scheduled", scheduled_at: `${new Date().toISOString().split("T")[0]}T11:00:00`, duration_minutes: 15, has_consultation: false },
  { id: "6", patient_name: "伊藤 雅子", patient_id: "p6", appointment_type: "online_followup", status: "scheduled", scheduled_at: `${new Date().toISOString().split("T")[0]}T14:00:00`, duration_minutes: 15, has_consultation: true },
  { id: "7", patient_name: "中村 大輔", patient_id: "p7", appointment_type: "in_person_initial", status: "scheduled", scheduled_at: `${new Date().toISOString().split("T")[0]}T14:30:00`, duration_minutes: 30, has_consultation: false },
  { id: "8", patient_name: "小林 由美", patient_id: "p8", appointment_type: "online_followup", status: "scheduled", scheduled_at: `${new Date().toISOString().split("T")[0]}T15:00:00`, duration_minutes: 15, has_consultation: true },
];

const DEMO_TASKS: PendingTask[] = [
  { type: "messages", label: "未読メッセージ", count: 4, icon: MessageSquare, href: "/doctor/patients", color: "text-blue-600 bg-blue-100" },
  { type: "prescriptions", label: "未承認処方", count: 2, icon: Pill, href: "/doctor/prescriptions", color: "text-teal-600 bg-teal-100" },
  { type: "lab_results", label: "確認待ち検査結果", count: 3, icon: FileText, href: "/doctor/patients", color: "text-purple-600 bg-purple-100" },
  { type: "vital_alerts", label: "バイタル異常アラート", count: 1, icon: AlertCircle, href: "/doctor/patients", color: "text-red-600 bg-red-100" },
];

const DEMO_STATS: MonthlyStats = {
  total_consultations: 187,
  online_rate: 73,
  retention_rate: 89,
  avg_duration: 14.2,
};

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS);
  const [tasks] = useState(DEMO_TASKS);
  const [stats] = useState(DEMO_STATS);
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "おはようございます" : h < 18 ? "こんにちは" : "お疲れさまです");
  }, []);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const { data: appts } = await supabase
        .from("appointments")
        .select("*, patients!inner(profiles!inner(display_name))")
        .eq("doctor_id", user.id)
        .gte("scheduled_at", todayStart.toISOString())
        .lte("scheduled_at", todayEnd.toISOString())
        .order("scheduled_at");

      if (appts && appts.length > 0) {
        setAppointments(
          appts.map((a: Record<string, unknown>) => ({
            id: a.id as string,
            patient_name: ((a.patients as Record<string, unknown>)?.profiles as Record<string, string>)?.display_name || "患者",
            patient_id: a.patient_id as string,
            appointment_type: a.appointment_type as string,
            status: a.status as string,
            scheduled_at: a.scheduled_at as string,
            duration_minutes: (a.duration_minutes as number) || 15,
            has_consultation: !!a.ai_consultation_id,
          }))
        );
      }
    } catch {
      /* use demo data */
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completedAppts = appointments.filter((a) => a.status === "completed").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting}、先生</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="患者を検索..."
              className="pl-9 w-48"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tasks.map((task) => (
          <Link key={task.type} href={task.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.color}`}>
                  <task.icon size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{task.count}</p>
                  <p className="text-xs text-muted-foreground">{task.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar size={18} className="text-teal-600" /> 本日の予約
                  <Badge className="bg-teal-600">
                    {completedAppts}/{appointments.length}
                  </Badge>
                </CardTitle>
                <Link href="/doctor/schedule">
                  <Button variant="ghost" size="sm" className="text-xs">
                    スケジュール管理 <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {appointments.map((a) => {
                const time = new Date(a.scheduled_at).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isOnline = a.appointment_type.startsWith("online") || a.appointment_type === "pre_consultation";
                const isCompleted = a.status === "completed";
                const isPast = new Date(a.scheduled_at) < new Date() && !isCompleted;

                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isCompleted ? "bg-gray-50 opacity-60" : isPast ? "bg-teal-50 border border-teal-200" : "bg-white border"
                    }`}
                  >
                    <div className="text-center min-w-[45px]">
                      <p className="text-sm font-bold">{time}</p>
                      <p className="text-[10px] text-muted-foreground">{a.duration_minutes}分</p>
                    </div>
                    <div className="border-l pl-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/doctor/patients/${a.patient_id}`} className="font-medium text-sm hover:text-teal-600">
                          {a.patient_name}
                        </Link>
                        <Badge variant="outline" className="text-[10px]">
                          {isOnline ? <><Video size={8} className="mr-0.5" />オンライン</> : <><MapPin size={8} className="mr-0.5" />対面</>}
                        </Badge>
                        {a.has_consultation && (
                          <Badge variant="outline" className="text-[10px] text-teal-700 border-teal-300">AI問診済</Badge>
                        )}
                        {isCompleted && <Badge variant="secondary" className="text-[10px]">完了</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {isOnline && !isCompleted && (
                        <Link href={`/doctor/consultations/${a.id}/video`}>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-xs h-7">
                            <Video size={12} className="mr-1" /> 開始
                          </Button>
                        </Link>
                      )}
                      {a.has_consultation && (
                        <Link href={`/doctor/patients/${a.patient_id}/consultation`}>
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            問診
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">月間統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">診療件数</span>
                <span className="font-bold">{stats.total_consultations}件</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">オンライン率</span>
                <span className="font-bold">{stats.online_rate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">患者継続率</span>
                <span className="font-bold text-green-600">{stats.retention_rate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">平均診療時間</span>
                <span className="font-bold">{stats.avg_duration}分</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell size={14} className="text-red-500" /> 最新アラート
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-medium text-red-700">山田 太郎 - 血圧上昇</p>
                  <p className="text-red-600">収縮期血圧 158mmHg（閾値: 140）</p>
                  <p className="text-muted-foreground">10分前</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                <AlertCircle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-medium text-yellow-700">高橋 美咲 - 血糖値注意</p>
                  <p className="text-yellow-600">空腹時血糖 132mg/dL</p>
                  <p className="text-muted-foreground">1時間前</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
