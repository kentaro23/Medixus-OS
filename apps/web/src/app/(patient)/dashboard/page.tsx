"use client";

import Link from "next/link";
import {
  MessageSquareHeart,
  Calendar,
  Pill,
  HeartPulse,
  Activity,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Clock,
  Droplets,
  Thermometer,
  Weight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const todayVitals = {
  bloodPressure: { systolic: 132, diastolic: 84 },
  heartRate: 72,
  bloodGlucose: 118,
  weight: 73.5,
  steps: 6420,
};

const upcomingAppointments = [
  { id: "1", doctor: "佐藤 一郎", specialty: "内科", date: "2026-03-30", time: "10:00", type: "online" as const },
  { id: "2", doctor: "鈴木 花子", specialty: "糖尿病内科", date: "2026-04-05", time: "14:30", type: "in_person" as const },
];

const medicationReminders = [
  { name: "メトホルミン 500mg", time: "08:00", taken: true },
  { name: "メトホルミン 500mg", time: "20:00", taken: false },
  { name: "アムロジピン 5mg", time: "08:00", taken: true },
];

const riskScores = [
  { label: "高血圧リスク", score: 72, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "糖尿病リスク", score: 58, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "心血管リスク", score: 35, color: "text-green-600", bg: "bg-green-50" },
];

export default function PatientDashboard() {
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">おはようございます、山田さん</h1>
        <p className="text-muted-foreground mt-1">今日の健康状態と予定を確認しましょう</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm">気になる症状がありますか？</p>
            <p className="text-xl font-bold mt-1">AIが症状をお伺いし、適切な対応をご案内します</p>
          </div>
          <Link href="/triage">
            <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-lg">
              <MessageSquareHeart size={18} className="mr-2" />
              AI問診を始める
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Activity size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">血圧</p>
                <p className="text-lg font-bold">
                  {todayVitals.bloodPressure.systolic}/{todayVitals.bloodPressure.diastolic}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <HeartPulse size={20} className="text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">心拍数</p>
                <p className="text-lg font-bold">{todayVitals.heartRate} bpm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Droplets size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">血糖値</p>
                <p className="text-lg font-bold">{todayVitals.bloodGlucose} mg/dL</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Weight size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">体重</p>
                <p className="text-lg font-bold">{todayVitals.weight} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-500" /> 予約
                </CardTitle>
                <Link href="/appointments" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  すべて見る <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-700">
                    <span className="text-xs font-bold">{new Date(apt.date).getMonth() + 1}/{new Date(apt.date).getDate()}</span>
                    <span className="text-[10px]">{apt.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{apt.doctor} 先生</p>
                    <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                  </div>
                  <Badge variant={apt.type === "online" ? "default" : "outline"} className={apt.type === "online" ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100" : ""}>
                    {apt.type === "online" ? "オンライン" : "対面"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill size={18} className="text-blue-500" /> 今日の服薬
                </CardTitle>
                <Link href="/medications" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  すべて見る <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {medicationReminders.map((med, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${med.taken ? "bg-green-100" : "bg-gray-100"}`}>
                    {med.taken ? (
                      <span className="text-green-600 text-lg">✓</span>
                    ) : (
                      <Clock size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.time}</p>
                  </div>
                  {!med.taken && (
                    <Button size="sm" variant="outline" className="text-xs">
                      服用済み
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-500" /> リスクスコア
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskScores.map((rs) => (
                <div key={rs.label} className={`p-3 rounded-xl ${rs.bg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{rs.label}</span>
                    <span className={`text-lg font-bold ${rs.color}`}>{rs.score}</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${rs.score >= 70 ? "bg-amber-500" : rs.score >= 50 ? "bg-orange-400" : "bg-green-500"}`}
                      style={{ width: `${rs.score}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-2">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                AIが算出した参考スコアです。最終判断は医師が行います。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">血圧が基準値を超えています</p>
                  <p className="text-sm text-amber-700 mt-1">
                    直近3日間で収縮期血圧が130mmHg以上が続いています。
                  </p>
                  <Link href="/triage">
                    <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                      オンライン相談する
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
