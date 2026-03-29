"use client";

import { useState, use } from "react";
import {
  ArrowLeft,
  User,
  Activity,
  HeartPulse,
  Droplets,
  Pill,
  FileText,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PatientDetail {
  name: string;
  age: number;
  gender: string;
  dob: string;
  allergies: string[];
  medicalHistory: string[];
  currentMedications: string[];
  emergencyContact: string;
}

interface VitalPoint {
  date: string;
  bp_systolic: number;
  bp_diastolic: number;
  heart_rate: number;
  blood_glucose: number;
}

interface ConsultationEntry {
  id: string;
  date: string;
  triage_level: string;
  summary: string;
}

interface PrescriptionEntry {
  id: string;
  date: string;
  items: string[];
  status: string;
}

interface MedicalRecordEntry {
  id: string;
  date: string;
  doctor_name: string;
  subjective: string;
  assessment: string;
}

const DEMO_PATIENT: PatientDetail = {
  name: "山田 太郎",
  age: 54,
  gender: "男性",
  dob: "1971-05-15",
  allergies: ["ペニシリン"],
  medicalHistory: ["高血圧（2015年〜）", "2型糖尿病（2018年〜）"],
  currentMedications: ["メトホルミン 500mg 1日2回", "アムロジピン 5mg 1日1回"],
  emergencyContact: "山田 花子（妻）090-1234-5678",
};

const DEMO_VITALS: VitalPoint[] = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
  bp_systolic: 128 + Math.round(Math.random() * 20 - 5),
  bp_diastolic: 80 + Math.round(Math.random() * 12 - 4),
  heart_rate: 70 + Math.round(Math.random() * 12),
  blood_glucose: 110 + Math.round(Math.random() * 25 - 10),
}));

const DEMO_CONSULTATIONS: ConsultationEntry[] = [
  { id: "c1", date: "2026-03-26", triage_level: "routine", summary: "頭痛の問診。片頭痛の疑い。光過敏あり。" },
  { id: "c2", date: "2026-03-20", triage_level: "observation", summary: "軽度の腰痛。セルフケアで改善見込み。" },
];

const DEMO_PRESCRIPTIONS: PrescriptionEntry[] = [
  { id: "rx1", date: "2026-03-26", items: ["ロキソプロフェン 60mg", "レバミピド 100mg"], status: "dispensed" },
  { id: "rx2", date: "2026-03-01", items: ["メトホルミン 500mg", "アムロジピン 5mg"], status: "delivered" },
];

const DEMO_RECORDS: MedicalRecordEntry[] = [
  { id: "mr1", date: "2026-03-26", doctor_name: "佐藤 一郎", subjective: "頭痛（3日前から持続）", assessment: "片頭痛の疑い" },
  { id: "mr2", date: "2026-03-01", doctor_name: "佐藤 一郎", subjective: "定期受診（高血圧・糖尿病）", assessment: "血圧コントロール良好。HbA1c 6.8%で安定。" },
];

const TRIAGE_CONFIG: Record<string, { label: string; color: string }> = {
  emergency: { label: "緊急", color: "bg-red-600 text-white" },
  semi_urgent: { label: "準緊急", color: "bg-orange-500 text-white" },
  routine: { label: "通常", color: "bg-blue-500 text-white" },
  observation: { label: "経過観察", color: "bg-green-500 text-white" },
};

function MiniChart({ data, dataKey, color }: { data: VitalPoint[]; dataKey: keyof VitalPoint; color: string }) {
  const values = data.map((d) => d[dataKey] as number);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 1;

  return (
    <svg className="w-full h-12" viewBox={`0 0 ${values.length * 10} 48`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={values.map((v, i) => `${i * 10 + 5},${48 - ((v - min) / range) * 48}`).join(" ")}
      />
    </svg>
  );
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params);
  const [patient] = useState(DEMO_PATIENT);
  const [vitals] = useState(DEMO_VITALS);
  const [consultations] = useState(DEMO_CONSULTATIONS);
  const [prescriptions] = useState(DEMO_PRESCRIPTIONS);
  const [records] = useState(DEMO_RECORDS);

  const latestVital = vitals[vitals.length - 1];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/doctor/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> 患者一覧
          </Button>
        </Link>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
          <User size={28} className="text-teal-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">
            {patient.age}歳 {patient.gender} | {patient.dob}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {patient.allergies.map((a) => (
              <Badge key={a} variant="destructive" className="text-xs">
                アレルギー: {a}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/doctor/patients/${patientId}/consultation`}>
            <Button variant="outline" size="sm">
              <Stethoscope size={14} className="mr-1" /> AI問診
            </Button>
          </Link>
          <Link href={`/doctor/prescriptions/new?patient_id=${patientId}`}>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Pill size={14} className="mr-1" /> 処方作成
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Activity size={16} className="text-red-500 mx-auto mb-1" />
            <p className="font-bold">{latestVital.bp_systolic}/{latestVital.bp_diastolic}</p>
            <p className="text-xs text-muted-foreground">血圧</p>
            <MiniChart data={vitals} dataKey="bp_systolic" color="#ef4444" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <HeartPulse size={16} className="text-pink-500 mx-auto mb-1" />
            <p className="font-bold">{latestVital.heart_rate}</p>
            <p className="text-xs text-muted-foreground">心拍</p>
            <MiniChart data={vitals} dataKey="heart_rate" color="#ec4899" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Droplets size={16} className="text-blue-500 mx-auto mb-1" />
            <p className="font-bold">{latestVital.blood_glucose}</p>
            <p className="text-xs text-muted-foreground">血糖</p>
            <MiniChart data={vitals} dataKey="blood_glucose" color="#3b82f6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">基本情報</h4>
            <div className="text-xs space-y-0.5">
              <p>既往歴:</p>
              {patient.medicalHistory.map((h) => (
                <p key={h} className="text-muted-foreground pl-2">・{h}</p>
              ))}
              <p className="mt-1">服薬中:</p>
              {patient.currentMedications.map((m) => (
                <p key={m} className="text-muted-foreground pl-2">・{m}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Stethoscope size={14} className="text-teal-600" /> AI問診履歴
              </CardTitle>
              <Link href={`/doctor/patients/${patientId}/consultation`}>
                <Button variant="ghost" size="sm" className="text-xs">
                  全て見る <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {consultations.map((c) => (
              <div key={c.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                <Badge className={TRIAGE_CONFIG[c.triage_level]?.color || "bg-gray-500"} >
                  {TRIAGE_CONFIG[c.triage_level]?.label || c.triage_level}
                </Badge>
                <div className="flex-1">
                  <p className="text-xs text-gray-700">{c.summary}</p>
                  <p className="text-[10px] text-muted-foreground">{c.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pill size={14} className="text-teal-600" /> 処方履歴
              </CardTitle>
              <Link href="/doctor/prescriptions">
                <Button variant="ghost" size="sm" className="text-xs">
                  全て見る <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {prescriptions.map((p) => (
              <div key={p.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">{p.items.join(", ")}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {p.status === "dispensed" ? "調剤済" : p.status === "delivered" ? "配送済" : p.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{p.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText size={14} className="text-teal-600" /> カルテ履歴
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {records.map((r) => (
              <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{r.date} — {r.doctor_name}</span>
                </div>
                <div className="text-xs space-y-1">
                  <p>
                    <span className="text-muted-foreground font-medium">S:</span> {r.subjective}
                  </p>
                  <p>
                    <span className="text-muted-foreground font-medium">A:</span> {r.assessment}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
