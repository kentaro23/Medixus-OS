"use client";

import Link from "next/link";
import {
  Calendar,
  MessageSquareHeart,
  FileText,
  AlertTriangle,
  Clock,
  Video,
  ArrowRight,
  User,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const todayAppointments = [
  { id: "1", patient: "山田 太郎", time: "10:00", type: "online", status: "scheduled", reason: "高血圧 経過観察" },
  { id: "2", patient: "田中 美咲", time: "10:30", type: "online", status: "scheduled", reason: "糖尿病 フォロー" },
  { id: "3", patient: "佐々木 健", time: "11:00", type: "in_person", status: "waiting", reason: "腰痛" },
  { id: "4", patient: "鈴木 あゆみ", time: "11:30", type: "online", status: "scheduled", reason: "不眠症 相談" },
  { id: "5", patient: "高橋 次郎", time: "14:00", type: "online", status: "scheduled", reason: "高脂血症 経過" },
  { id: "6", patient: "伊藤 真理", time: "14:30", type: "online", status: "completed", reason: "片頭痛 フォロー" },
  { id: "7", patient: "渡辺 翔太", time: "15:00", type: "in_person", status: "scheduled", reason: "健診結果 説明" },
  { id: "8", patient: "中村 さくら", time: "15:30", type: "online", status: "scheduled", reason: "花粉症" },
];

const pendingTasks = [
  { type: "triage", label: "AI問診確認待ち", count: 3, icon: MessageSquareHeart, color: "text-amber-600 bg-amber-50", href: "/doctor/consultations" },
  { type: "prescription", label: "処方承認待ち", count: 2, icon: FileText, color: "text-blue-600 bg-blue-50", href: "/doctor/prescriptions" },
  { type: "alert", label: "バイタルアラート", count: 1, icon: AlertTriangle, color: "text-red-600 bg-red-50", href: "/doctor/patients" },
  { type: "message", label: "未読メッセージ", count: 4, icon: MessageSquareHeart, color: "text-purple-600 bg-purple-50", href: "#" },
];

const statusIcon: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  scheduled: { icon: Clock, class: "text-blue-500" },
  waiting: { icon: AlertTriangle, class: "text-amber-500" },
  in_progress: { icon: Video, class: "text-green-500" },
  completed: { icon: CheckCircle2, class: "text-gray-400" },
};

export default function DoctorDashboard() {
  const completedCount = todayAppointments.filter((a) => a.status === "completed").length;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">おはようございます、佐藤先生</h1>
        <p className="text-muted-foreground mt-1">
          本日の予約: {todayAppointments.length}件 | 完了: {completedCount}件 |
          未対応タスク: {pendingTasks.reduce((s, t) => s + t.count, 0)}件
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pendingTasks.map((task) => (
          <Link key={task.type} href={task.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${task.color}`}>
                    <task.icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{task.count}</p>
                    <p className="text-xs text-muted-foreground">{task.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar size={18} className="text-teal-500" /> 本日のスケジュール
                </CardTitle>
                <Link href="/doctor/schedule" className="text-sm text-teal-600 flex items-center gap-1">
                  全て表示 <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayAppointments.map((apt) => {
                const si = statusIcon[apt.status] || statusIcon.scheduled;
                return (
                  <div
                    key={apt.id}
                    className={`flex items-center gap-4 p-3 border rounded-xl hover:bg-gray-50 transition-colors ${
                      apt.status === "completed" ? "opacity-50" : ""
                    }`}
                  >
                    <div className="w-12 text-center">
                      <p className="text-sm font-bold">{apt.time}</p>
                    </div>
                    <si.icon size={16} className={si.class} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{apt.patient}</p>
                      <p className="text-xs text-muted-foreground">{apt.reason}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {apt.type === "online" ? "オンライン" : "対面"}
                    </Badge>
                    {apt.status !== "completed" && (
                      <Button size="sm" variant="outline" className="text-xs">
                        {apt.type === "online" ? (
                          <>
                            <Video size={12} className="mr-1" /> 入室
                          </>
                        ) : (
                          "開始"
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquareHeart size={18} className="text-amber-500" /> AI問診確認待ち
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { patient: "山田 太郎", urgency: "normal", complaint: "頭痛", time: "9:45" },
                { patient: "田中 美咲", urgency: "semi_urgent", complaint: "胸痛・動悸", time: "10:10" },
                { patient: "鈴木 あゆみ", urgency: "observation", complaint: "不眠", time: "11:15" },
              ].map((c) => (
                <Link key={c.patient} href="/doctor/consultations">
                  <div className="p-3 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{c.patient}</span>
                      <Badge
                        className={
                          c.urgency === "semi_urgent"
                            ? "bg-orange-100 text-orange-700"
                            : c.urgency === "normal"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }
                      >
                        {c.urgency === "semi_urgent" ? "準緊急" : c.urgency === "normal" ? "通常" : "経過観察"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      主訴: {c.complaint} | {c.time}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 shrink-0" />
                <div>
                  <p className="font-medium text-red-800">バイタルアラート</p>
                  <p className="text-sm text-red-700 mt-1">
                    田中美咲さんの血圧が160/100mmHgを超えています。3日連続の上昇傾向。
                  </p>
                  <Link href="/doctor/patients">
                    <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                      確認する
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
