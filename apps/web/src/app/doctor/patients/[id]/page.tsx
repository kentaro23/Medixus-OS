"use client";

import Link from "next/link";
import {
  ArrowLeft,
  User,
  Activity,
  Pill,
  FileText,
  Calendar,
  AlertTriangle,
  AlertCircle,
  HeartPulse,
  Droplets,
  Weight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const patient = {
  name: "山田 太郎",
  age: 45,
  gender: "男性",
  conditions: ["高血圧", "2型糖尿病"],
  allergies: [{ substance: "ペニシリン系", reaction: "蕁麻疹", severity: "moderate" }],
  medications: [
    { name: "アムロジピン 5mg", frequency: "1日1回 朝食後" },
    { name: "メトホルミン 500mg", frequency: "1日2回 朝夕食後" },
  ],
};

const bpHistory = [
  { date: "3/22", systolic: 128, diastolic: 82 },
  { date: "3/23", systolic: 135, diastolic: 88 },
  { date: "3/24", systolic: 130, diastolic: 85 },
  { date: "3/25", systolic: 142, diastolic: 92 },
  { date: "3/26", systolic: 138, diastolic: 86 },
  { date: "3/27", systolic: 132, diastolic: 84 },
  { date: "3/28", systolic: 136, diastolic: 87 },
];

const records = [
  { date: "2026-03-15", subjective: "高血圧のフォロー。自覚症状なし。", assessment: "高血圧 - コントロール良好", plan: "現行処方継続。30日後再診。" },
  { date: "2026-02-15", subjective: "軽度の頭重感あり。", assessment: "高血圧 - やや不安定", plan: "アムロジピン 5mg → 同用量継続。2週間後にBP再確認。" },
];

export default function PatientDetailPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/doctor/patients">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} className="mr-1" /> 戻る</Button>
        </Link>
      </div>

      <div className="flex items-start gap-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <User size={28} className="text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <span className="text-muted-foreground">{patient.age}歳 {patient.gender}</span>
            <Badge className="bg-amber-100 text-amber-700">リスク: 中</Badge>
          </div>
          <div className="flex gap-2">
            {patient.conditions.map((c) => <Badge key={c} variant="outline">{c}</Badge>)}
          </div>
          {patient.allergies.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-sm text-red-600">
                アレルギー: {patient.allergies.map((a) => `${a.substance}（${a.reaction}）`).join(", ")}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/doctor/prescriptions/new">
            <Button variant="outline"><FileText size={14} className="mr-1" /> 処方作成</Button>
          </Link>
          <Button className="bg-teal-600 hover:bg-teal-700"><Calendar size={14} className="mr-1" /> 予約作成</Button>
        </div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">サマリー</TabsTrigger>
          <TabsTrigger value="vitals">バイタル</TabsTrigger>
          <TabsTrigger value="records">カルテ</TabsTrigger>
          <TabsTrigger value="medications">処方</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">直近バイタル</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {[
                  { label: "血圧", value: "132/84", unit: "mmHg", icon: Activity, color: "text-red-500" },
                  { label: "心拍", value: "72", unit: "bpm", icon: HeartPulse, color: "text-pink-500" },
                  { label: "血糖", value: "118", unit: "mg/dL", icon: Droplets, color: "text-blue-500" },
                  { label: "体重", value: "73.5", unit: "kg", icon: Weight, color: "text-green-500" },
                ].map((v) => (
                  <div key={v.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <v.icon size={18} className={v.color} />
                    <div>
                      <p className="text-xs text-muted-foreground">{v.label}</p>
                      <p className="font-bold">{v.value} <span className="text-xs font-normal text-muted-foreground">{v.unit}</span></p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">現行処方</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {patient.medications.map((m) => (
                  <div key={m.name} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Pill size={16} className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.frequency}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader><CardTitle className="text-lg">血圧推移（7日間）</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bpHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis domain={[60, 160]} fontSize={12} />
                    <Tooltip />
                    <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label="高血圧基準" />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="収縮期" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="拡張期" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <div className="space-y-4">
            {records.map((r) => (
              <Card key={r.date}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{r.date}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><span className="text-xs font-bold text-muted-foreground">S</span> <span className="text-sm">{r.subjective}</span></div>
                  <div><span className="text-xs font-bold text-muted-foreground">A</span> <span className="text-sm">{r.assessment}</span></div>
                  <div><span className="text-xs font-bold text-muted-foreground">P</span> <span className="text-sm">{r.plan}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="medications">
          <Card>
            <CardContent className="pt-6 space-y-3">
              {patient.medications.map((m) => (
                <div key={m.name} className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="flex items-center gap-3">
                    <Pill size={18} className="text-blue-500" />
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.frequency}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300">処方中</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
