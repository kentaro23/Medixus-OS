"use client";

import { useState, useCallback, useEffect } from "react";
import {
  HeartPulse,
  Activity,
  Droplets,
  Weight,
  Plus,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Thermometer,
  Footprints,
  X,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface VitalEntry {
  date: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  heart_rate?: number;
  blood_glucose?: number;
  body_weight?: number;
  body_temp?: number;
  steps?: number;
}

function generateDemoData(): VitalEntry[] {
  const entries: VitalEntry[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    entries.push({
      date: d.toISOString().split("T")[0],
      bp_systolic: 125 + Math.round(Math.random() * 20 - 5),
      bp_diastolic: 78 + Math.round(Math.random() * 15 - 5),
      heart_rate: 68 + Math.round(Math.random() * 15),
      blood_glucose: 105 + Math.round(Math.random() * 30 - 10),
      body_weight: 68 + Math.round(Math.random() * 20 - 10) / 10,
      body_temp: 36.2 + Math.round(Math.random() * 8) / 10,
      steps: 4000 + Math.round(Math.random() * 6000),
    });
  }
  return entries;
}

const VITAL_THRESHOLDS = {
  bp_systolic: { high: 140, low: 90, unit: "mmHg", label: "収縮期血圧" },
  bp_diastolic: { high: 90, low: 60, unit: "mmHg", label: "拡張期血圧" },
  heart_rate: { high: 100, low: 50, unit: "bpm", label: "心拍数" },
  blood_glucose: { high: 126, low: 70, unit: "mg/dL", label: "血糖値" },
  body_temp: { high: 37.5, low: 35.0, unit: "℃", label: "体温" },
};

function getTrend(data: VitalEntry[], key: keyof VitalEntry): "up" | "down" | "stable" {
  const vals = data.slice(-7).map((d) => d[key] as number).filter(Boolean);
  if (vals.length < 2) return "stable";
  const first = vals.slice(0, Math.ceil(vals.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(vals.length / 2);
  const last = vals.slice(-Math.ceil(vals.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(vals.length / 2);
  const diff = ((last - first) / first) * 100;
  if (diff > 2) return "up";
  if (diff < -2) return "down";
  return "stable";
}

function getAvg(data: VitalEntry[], key: keyof VitalEntry): number {
  const vals = data.slice(-7).map((d) => d[key] as number).filter(Boolean);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function SparkLine({
  data,
  dataKey,
  color,
  threshold,
  height = 48,
}: {
  data: VitalEntry[];
  dataKey: keyof VitalEntry;
  color: string;
  threshold?: { high: number; low: number };
  height?: number;
}) {
  const values = data.map((d) => (d[dataKey] as number) || 0).filter((v) => v > 0);
  if (values.length === 0) return null;
  const min = Math.min(...values) * 0.97;
  const max = Math.max(...values) * 1.03;
  const range = max - min || 1;

  const points = values.map((v, i) => ({
    x: (i / (values.length - 1)) * 100,
    y: 100 - ((v - min) / range) * 100,
    isAbnormal: threshold ? v > threshold.high || v < threshold.low : false,
  }));

  return (
    <svg className="w-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {threshold && (
        <line
          x1="0" x2="100"
          y1={`${100 - ((threshold.high - min) / range) * 100}`}
          y2={`${100 - ((threshold.high - min) / range) * 100}`}
          stroke="#fca5a5"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      )}
      <polygon
        fill={`url(#grad-${dataKey})`}
        points={[
          `0,100`,
          ...points.map((p) => `${p.x},${p.y}`),
          `100,100`,
        ].join(" ")}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
      />
      {points.filter((p) => p.isAbnormal).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#ef4444" />
      ))}
    </svg>
  );
}

function FullChart({
  data,
  dataKey,
  color,
  threshold,
}: {
  data: VitalEntry[];
  dataKey: keyof VitalEntry;
  color: string;
  threshold?: { high: number; low: number };
}) {
  const values = data.map((d) => (d[dataKey] as number) || 0).filter((v) => v > 0);
  if (values.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">データなし</p>;

  const allValues = data.map((d) => d[dataKey] as number).filter(Boolean);
  const min = Math.min(...allValues) * 0.94;
  const max = Math.max(...allValues) * 1.06;
  const range = max - min || 1;

  const pts = data
    .map((d, i) => ({ v: d[dataKey] as number, date: d.date, i }))
    .filter((p) => p.v > 0);

  return (
    <div className="space-y-2">
      <div className="h-40 relative">
        <svg className="w-full h-full" viewBox={`0 0 ${data.length * 10} 100`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`fullgrad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {threshold && (
            <>
              <line
                x1="0" x2={data.length * 10}
                y1={`${100 - ((threshold.high - min) / range) * 100}`}
                y2={`${100 - ((threshold.high - min) / range) * 100}`}
                stroke="#fca5a5" strokeWidth="0.8" strokeDasharray="3,2"
              />
              <line
                x1="0" x2={data.length * 10}
                y1={`${100 - ((threshold.low - min) / range) * 100}`}
                y2={`${100 - ((threshold.low - min) / range) * 100}`}
                stroke="#bbf7d0" strokeWidth="0.8" strokeDasharray="3,2"
              />
            </>
          )}
          <polygon
            fill={`url(#fullgrad-${dataKey})`}
            points={[
              `0,100`,
              ...pts.map((p) => `${p.i * 10 + 5},${100 - ((p.v - min) / range) * 100}`),
              `${(data.length - 1) * 10 + 5},100`,
            ].join(" ")}
          />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pts.map((p) => `${p.i * 10 + 5},${100 - ((p.v - min) / range) * 100}`).join(" ")}
          />
          {pts.map((p, idx) => {
            const isAbnormal = threshold ? p.v > threshold.high || p.v < threshold.low : false;
            return (
              <circle
                key={idx}
                cx={p.i * 10 + 5}
                cy={100 - ((p.v - min) / range) * 100}
                r={isAbnormal ? "2.5" : "1.5"}
                fill={isAbnormal ? "#ef4444" : color}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
      {threshold && (
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-300 inline-block" /> 上限 {threshold.high}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-300 inline-block" /> 下限 {threshold.low}</span>
        </div>
      )}
    </div>
  );
}

type ActiveChart = keyof VitalEntry | null;

export default function HealthPage() {
  const [data, setData] = useState<VitalEntry[]>(generateDemoData);
  const [showInput, setShowInput] = useState(false);
  const [activeChart, setActiveChart] = useState<ActiveChart>(null);
  const [saved, setSaved] = useState(false);
  const [inputValues, setInputValues] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    heart_rate: "",
    blood_glucose: "",
    body_weight: "",
    body_temp: "",
    steps: "",
  });

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const thirtyDaysAgo = new Date(Date.now() - 86400000 * 30).toISOString();
      const { data: vitals } = await supabase
        .from("vital_records")
        .select("vital_type, value, recorded_at")
        .eq("patient_id", user.id)
        .gte("recorded_at", thirtyDaysAgo)
        .order("recorded_at");
      if (vitals && vitals.length > 0) {
        const grouped: Record<string, Partial<VitalEntry>> = {};
        for (const v of vitals) {
          const date = new Date(v.recorded_at).toISOString().split("T")[0];
          if (!grouped[date]) grouped[date] = { date };
          (grouped[date] as Record<string, unknown>)[v.vital_type as string] = v.value;
        }
        const entries = Object.values(grouped).sort((a, b) =>
          (a.date || "").localeCompare(b.date || "")
        ) as VitalEntry[];
        if (entries.length > 0) setData(entries);
      }
    } catch { /* use demo data */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveVitals() {
    const today = new Date().toISOString().split("T")[0];
    const newEntry: VitalEntry = { date: today };
    const records: Array<{ vital_type: string; value: number; unit: string }> = [];

    const fields: Array<[string, keyof VitalEntry, string, string]> = [
      ["bp_systolic", "bp_systolic", "blood_pressure_systolic", "mmHg"],
      ["bp_diastolic", "bp_diastolic", "blood_pressure_diastolic", "mmHg"],
      ["heart_rate", "heart_rate", "heart_rate", "bpm"],
      ["blood_glucose", "blood_glucose", "blood_glucose", "mg/dL"],
      ["body_weight", "body_weight", "body_weight", "kg"],
      ["body_temp", "body_temp", "body_temperature", "℃"],
      ["steps", "steps", "steps", "steps"],
    ];

    for (const [inputKey, entryKey, dbKey, unit] of fields) {
      const val = inputValues[inputKey as keyof typeof inputValues];
      if (val) {
        (newEntry as unknown as Record<string, unknown>)[entryKey] = Number(val);
        records.push({ vital_type: dbKey, value: Number(val), unit });
      }
    }

    if (records.length === 0) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("vital_records").insert(
          records.map((r) => ({
            patient_id: user.id,
            recorded_at: new Date().toISOString(),
            source: "manual",
            ...r,
          }))
        );
        for (const r of records) {
          const thKey = r.vital_type.replace("blood_pressure_", "bp_") as keyof typeof VITAL_THRESHOLDS;
          const th = VITAL_THRESHOLDS[thKey];
          if (th && (r.value > th.high || r.value < th.low)) {
            await supabase.from("vital_alerts").insert({
              patient_id: user.id,
              alert_type: r.value > th.high ? "high" : "low",
              severity: r.value > th.high * 1.2 || r.value < th.low * 0.8 ? "critical" : "warning",
              message: `${th.label}が異常値です: ${r.value}${th.unit}`,
              online_consultation_suggested: true,
            });
          }
        }
      }
    } catch { /* demo mode */ }

    setData((prev) => {
      const existing = prev.findIndex((e) => e.date === today);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], ...newEntry };
        return updated;
      }
      return [...prev, newEntry];
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowInput(false);
    setInputValues({ bp_systolic: "", bp_diastolic: "", heart_rate: "", blood_glucose: "", body_weight: "", body_temp: "", steps: "" });
  }

  const latest = data[data.length - 1];
  const week7 = data.slice(-7);

  const abnormalCount = [
    latest?.bp_systolic && (latest.bp_systolic > 140 || latest.bp_systolic < 90),
    latest?.heart_rate && (latest.heart_rate > 100 || latest.heart_rate < 50),
    latest?.blood_glucose && (latest.blood_glucose > 126 || latest.blood_glucose < 70),
    latest?.body_temp && (latest.body_temp > 37.5 || latest.body_temp < 35.0),
  ].filter(Boolean).length;

  const vitals = [
    {
      icon: Activity,
      label: "血圧",
      value: latest?.bp_systolic && latest?.bp_diastolic
        ? `${latest.bp_systolic}/${latest.bp_diastolic}`
        : "-",
      unit: "mmHg",
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-100",
      dataKey: "bp_systolic" as keyof VitalEntry,
      chartColor: "#ef4444",
      threshold: VITAL_THRESHOLDS.bp_systolic,
      raw: latest?.bp_systolic,
      avg7: getAvg(data, "bp_systolic"),
    },
    {
      icon: HeartPulse,
      label: "心拍数",
      value: latest?.heart_rate || "-",
      unit: "bpm",
      color: "text-pink-500",
      bg: "bg-pink-50",
      border: "border-pink-100",
      dataKey: "heart_rate" as keyof VitalEntry,
      chartColor: "#ec4899",
      threshold: VITAL_THRESHOLDS.heart_rate,
      raw: latest?.heart_rate,
      avg7: getAvg(data, "heart_rate"),
    },
    {
      icon: Droplets,
      label: "血糖値",
      value: latest?.blood_glucose || "-",
      unit: "mg/dL",
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-100",
      dataKey: "blood_glucose" as keyof VitalEntry,
      chartColor: "#3b82f6",
      threshold: VITAL_THRESHOLDS.blood_glucose,
      raw: latest?.blood_glucose,
      avg7: getAvg(data, "blood_glucose"),
    },
    {
      icon: Weight,
      label: "体重",
      value: latest?.body_weight || "-",
      unit: "kg",
      color: "text-green-500",
      bg: "bg-green-50",
      border: "border-green-100",
      dataKey: "body_weight" as keyof VitalEntry,
      chartColor: "#22c55e",
      threshold: undefined,
      raw: latest?.body_weight,
      avg7: getAvg(data, "body_weight"),
    },
    {
      icon: Thermometer,
      label: "体温",
      value: latest?.body_temp || "-",
      unit: "℃",
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-100",
      dataKey: "body_temp" as keyof VitalEntry,
      chartColor: "#f97316",
      threshold: VITAL_THRESHOLDS.body_temp,
      raw: latest?.body_temp,
      avg7: getAvg(data, "body_temp"),
    },
    {
      icon: Footprints,
      label: "歩数",
      value: latest?.steps ? latest.steps.toLocaleString() : "-",
      unit: "歩",
      color: "text-teal-500",
      bg: "bg-teal-50",
      border: "border-teal-100",
      dataKey: "steps" as keyof VitalEntry,
      chartColor: "#14b8a6",
      threshold: undefined,
      raw: latest?.steps,
      avg7: getAvg(data, "steps"),
    },
  ];

  const activeVital = activeChart ? vitals.find((v) => v.dataKey === activeChart) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">健康データ</h1>
          <p className="text-sm text-muted-foreground mt-1">過去30日間のバイタルデータ推移</p>
        </div>
        <Button onClick={() => setShowInput(!showInput)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" /> バイタル記録
        </Button>
      </div>

      {/* Abnormal Alert */}
      {abnormalCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">{abnormalCount}件の異常値が検出されています</p>
            <p className="text-xs text-red-600 mt-0.5">最新のバイタルデータに異常値が含まれています。医師にご相談ください。</p>
          </div>
        </div>
      )}

      {/* Saved Feedback */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700">
          <CheckCircle2 size={16} />
          <span className="text-sm font-medium">バイタルデータを記録しました</span>
        </div>
      )}

      {/* Input Panel */}
      {showInput && (
        <Card className="border-indigo-300 bg-indigo-50/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">バイタルデータを入力</h3>
              <button onClick={() => setShowInput(false)}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "bp_systolic", label: "血圧（上）", unit: "mmHg", placeholder: "132" },
                { key: "bp_diastolic", label: "血圧（下）", unit: "mmHg", placeholder: "84" },
                { key: "heart_rate", label: "心拍数", unit: "bpm", placeholder: "72" },
                { key: "blood_glucose", label: "血糖値", unit: "mg/dL", placeholder: "105" },
                { key: "body_weight", label: "体重", unit: "kg", placeholder: "68.5", step: "0.1" },
                { key: "body_temp", label: "体温", unit: "℃", placeholder: "36.4", step: "0.1" },
                { key: "steps", label: "歩数", unit: "歩", placeholder: "8000" },
              ].map((field) => (
                <div key={field.key}>
                  <Label className="text-xs">{field.label} <span className="text-muted-foreground">({field.unit})</span></Label>
                  <Input
                    type="number"
                    step={field.step || "1"}
                    placeholder={field.placeholder}
                    value={inputValues[field.key as keyof typeof inputValues]}
                    onChange={(e) => setInputValues({ ...inputValues, [field.key]: e.target.value })}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveVitals} className="bg-indigo-600 hover:bg-indigo-700">
                記録する
              </Button>
              <Button variant="ghost" onClick={() => setShowInput(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards with Sparklines */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {vitals.map((v) => {
          const trend = getTrend(data, v.dataKey);
          const isAbnormal = v.threshold && v.raw && (v.raw > v.threshold.high || v.raw < v.threshold.low);
          const isActive = activeChart === v.dataKey;

          return (
            <Card
              key={v.label}
              className={`cursor-pointer transition-all ${
                isAbnormal ? "border-red-300" : isActive ? "ring-2 ring-indigo-400" : "hover:shadow-md"
              }`}
              onClick={() => setActiveChart(isActive ? null : v.dataKey)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <v.icon size={14} className={v.color} />
                      <span className="text-xs text-muted-foreground">{v.label}</span>
                      {isAbnormal && (
                        <AlertCircle size={12} className="text-red-500" />
                      )}
                    </div>
                    <p className="text-xl font-bold">{v.value}</p>
                    <p className="text-[10px] text-muted-foreground">{v.unit}</p>
                  </div>
                  <div className="text-right">
                    {trend === "up" ? (
                      <TrendingUp size={16} className={isAbnormal ? "text-red-500" : "text-green-500"} />
                    ) : trend === "down" ? (
                      <TrendingDown size={16} className={isAbnormal ? "text-green-500" : "text-blue-500"} />
                    ) : (
                      <Minus size={16} className="text-gray-400" />
                    )}
                    {v.avg7 > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        7日平均<br />
                        {v.dataKey === "steps"
                          ? Math.round(v.avg7).toLocaleString()
                          : v.avg7.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
                <SparkLine
                  data={data.slice(-14)}
                  dataKey={v.dataKey}
                  color={v.chartColor}
                  threshold={v.threshold}
                  height={40}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Chart */}
      {activeChart && activeVital && (
        <Card className="border-indigo-200">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <activeVital.icon size={16} className={activeVital.color} />
              {activeVital.label}の推移（30日間）
            </CardTitle>
            <button onClick={() => setActiveChart(null)}>
              <X size={16} className="text-muted-foreground" />
            </button>
          </CardHeader>
          <CardContent>
            <FullChart
              data={data}
              dataKey={activeChart}
              color={activeVital.chartColor}
              threshold={activeVital.threshold}
            />
          </CardContent>
        </Card>
      )}

      {/* 7-Day Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">7日間サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                label: "血圧（収縮期）",
                key: "bp_systolic" as keyof VitalEntry,
                unit: "mmHg",
                threshold: VITAL_THRESHOLDS.bp_systolic,
                color: "#ef4444",
              },
              {
                label: "心拍数",
                key: "heart_rate" as keyof VitalEntry,
                unit: "bpm",
                threshold: VITAL_THRESHOLDS.heart_rate,
                color: "#ec4899",
              },
              {
                label: "血糖値",
                key: "blood_glucose" as keyof VitalEntry,
                unit: "mg/dL",
                threshold: VITAL_THRESHOLDS.blood_glucose,
                color: "#3b82f6",
              },
            ].map((item) => {
              const vals = week7.map((d) => d[item.key] as number).filter(Boolean);
              if (vals.length === 0) return null;
              const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
              const max = Math.max(...vals);
              const min = Math.min(...vals);
              const isHighAvg = avg > item.threshold.high;
              const isLowAvg = avg < item.threshold.low;

              return (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-28 shrink-0">{item.label}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (avg / item.threshold.high) * 80)}%`,
                            backgroundColor: isHighAvg ? "#ef4444" : isLowAvg ? "#f59e0b" : item.color,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-24 text-right">
                        {avg.toFixed(1)} {item.unit}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      範囲: {min.toFixed(0)}–{max.toFixed(0)} {item.unit}
                    </p>
                  </div>
                  {(isHighAvg || isLowAvg) && (
                    <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs shrink-0">
                      要注意
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
