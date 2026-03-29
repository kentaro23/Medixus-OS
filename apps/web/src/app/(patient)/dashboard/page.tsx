"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Pill,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Stethoscope,
  CheckCircle2,
  Activity,
  ChevronRight,
  Droplets,
  Footprints,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface UpcomingAppointment {
  id: string;
  doctor_name: string;
  scheduled_at: string;
  appointment_type: string;
}

interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  taken: boolean;
}

interface RiskScore {
  type: string;
  label: string;
  score: number;
  trend: "up" | "down" | "stable";
}

interface VitalSummary {
  bp_systolic: number;
  bp_diastolic: number;
  heart_rate: number;
  blood_glucose: number;
  body_weight: number;
  body_temp: number;
  steps: number;
}

const DEMO_APPOINTMENT: UpcomingAppointment = {
  id: "a1",
  doctor_name: "佐藤 一郎 先生",
  scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
  appointment_type: "online_followup",
};

const DEMO_MEDICATIONS: MedicationReminder[] = [
  { id: "m1", name: "メトホルミン", dosage: "500mg", frequency: "朝食後", taken: false },
  { id: "m2", name: "アムロジピン", dosage: "5mg", frequency: "朝食後", taken: false },
  { id: "m3", name: "メトホルミン", dosage: "500mg", frequency: "夕食後", taken: false },
];

const DEMO_RISKS: RiskScore[] = [
  { type: "hypertension", label: "高血圧", score: 62, trend: "down" },
  { type: "diabetes", label: "糖尿病", score: 45, trend: "stable" },
  { type: "cardiovascular", label: "心血管", score: 28, trend: "down" },
];

const DEMO_VITALS: VitalSummary = {
  bp_systolic: 132,
  bp_diastolic: 84,
  heart_rate: 72,
  blood_glucose: 118,
  body_weight: 68.5,
  body_temp: 36.4,
  steps: 6842,
};

export default function PatientDashboardPage() {
  const [appointment, setAppointment] = useState<UpcomingAppointment | null>(DEMO_APPOINTMENT);
  const [medications, setMedications] = useState(DEMO_MEDICATIONS);
  const [risks, setRisks] = useState(DEMO_RISKS);
  const [vitals, setVitals] = useState(DEMO_VITALS);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "おはようございます" : h < 18 ? "こんにちは" : "こんばんは");
  }, []);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: appts } = await supabase
        .from("appointments")
        .select("id, scheduled_at, appointment_type, doctor_id")
        .eq("patient_id", user.id)
        .eq("status", "scheduled")
        .gt("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(1);

      if (appts?.[0]) {
        let doctorName = "医師";
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", appts[0].doctor_id)
          .single();
        if (profile) doctorName = profile.display_name;

        setAppointment({
          id: appts[0].id,
          doctor_name: doctorName,
          scheduled_at: appts[0].scheduled_at,
          appointment_type: appts[0].appointment_type,
        });
      }
    } catch {
      /* use demo data */
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function toggleMed(id: string) {
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m)));
  }

  function daysUntil(date: string) {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    if (diff === 0) return "今日";
    if (diff === 1) return "明日";
    return `あと${diff}日`;
  }

  function getScoreColor(score: number) {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      {appointment && (
        <Link href={`/appointments`}>
          <Card className="border-indigo-200 bg-indigo-50/30 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">次回予約</p>
                  <p className="text-sm text-muted-foreground">{appointment.doctor_name}</p>
                  <p className="text-sm text-indigo-600 font-medium">
                    {new Date(appointment.scheduled_at).toLocaleDateString("ja-JP", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <Badge className="bg-indigo-600">{daysUntil(appointment.scheduled_at)}</Badge>
            </CardContent>
          </Card>
        </Link>
      )}

      <Link href="/consultation">
        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-14 text-base shadow-lg">
          <Stethoscope size={20} className="mr-3" />
          不安なことがあったらオンライン診療を申し込む
        </Button>
      </Link>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 text-center">
            <Activity size={18} className="text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{vitals.bp_systolic}/{vitals.bp_diastolic}</p>
            <p className="text-xs text-muted-foreground">血圧 (mmHg)</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 text-center">
            <HeartPulse size={18} className="text-pink-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{vitals.heart_rate}</p>
            <p className="text-xs text-muted-foreground">心拍 (bpm)</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 text-center">
            <Droplets size={18} className="text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{vitals.blood_glucose}</p>
            <p className="text-xs text-muted-foreground">血糖 (mg/dL)</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 text-center">
            <Footprints size={18} className="text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{vitals.steps.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">歩数</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill size={18} className="text-indigo-600" /> 今日の服薬
              </CardTitle>
              <Link href="/medications">
                <Button variant="ghost" size="sm" className="text-xs">
                  詳細 <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {medications.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleMed(m.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  m.taken ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    m.taken ? "bg-green-500 border-green-500" : "border-gray-300"
                  }`}
                >
                  {m.taken && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${m.taken ? "line-through text-gray-400" : ""}`}>
                    {m.name} {m.dosage}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.frequency}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-center text-muted-foreground pt-1">
              {medications.filter((m) => m.taken).length}/{medications.length} 服用済み
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" /> リスクスコア
              </CardTitle>
              <Link href="/health">
                <Button variant="ghost" size="sm" className="text-xs">
                  詳細 <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {risks.map((r) => (
              <div key={r.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${getScoreColor(r.score)}`}>{r.score}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                    {r.trend === "down" && <TrendingDown size={14} className="text-green-500 ml-1" />}
                    {r.trend === "up" && <TrendingUp size={14} className="text-red-500 ml-1" />}
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r.score >= 70 ? "bg-red-500" : r.score >= 40 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Link href="/health">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <HeartPulse size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">今日の血圧を記録しましょう</p>
              <p className="text-sm text-muted-foreground">バイタルデータを記録して健康状態を管理します</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
