"use client";

import { useState, useCallback, useEffect } from "react";
import {
  HeartPulse,
  Activity,
  Droplets,
  Weight,
  Plus,
  AlertCircle,
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

function SimpleChart({
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
  if (values.length === 0) return null;
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 1;
  const width = 100 / values.length;

  return (
    <div className="h-32 relative">
      {threshold && (
        <>
          <div
            className="absolute left-0 right-0 border-t border-dashed border-red-300"
            style={{ top: `${100 - ((threshold.high - min) / range) * 100}%` }}
          >
            <span className="text-[9px] text-red-400 absolute right-0 -top-3">{threshold.high}</span>
          </div>
        </>
      )}
      <svg className="w-full h-full" viewBox={`0 0 ${values.length * 10} 100`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={values
            .map((v, i) => `${i * 10 + 5},${100 - ((v - min) / range) * 100}`)
            .join(" ")}
        />
        {values.map((v, i) => {
          const isAbnormal = threshold && (v > threshold.high || v < threshold.low);
          return (
            <circle
              key={i}
              cx={i * 10 + 5}
              cy={100 - ((v - min) / range) * 100}
              r={isAbnormal ? "2.5" : "1.5"}
              fill={isAbnormal ? "#ef4444" : color}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<VitalEntry[]>(generateDemoData);
  const [showInput, setShowInput] = useState(false);
  const [inputValues, setInputValues] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    heart_rate: "",
    blood_glucose: "",
    body_weight: "",
    body_temp: "",
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
          const key = v.vital_type as string;
          (grouped[date] as Record<string, unknown>)[key] = v.value;
        }
        const entries = Object.values(grouped).sort((a, b) =>
          (a.date || "").localeCompare(b.date || "")
        ) as VitalEntry[];
        if (entries.length > 0) setData(entries);
      }
    } catch {
      /* use demo data */
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveVitals() {
    const today = new Date().toISOString().split("T")[0];
    const newEntry: VitalEntry = { date: today };

    const records: Array<{ vital_type: string; value: number; unit: string }> = [];

    if (inputValues.bp_systolic) {
      newEntry.bp_systolic = Number(inputValues.bp_systolic);
      records.push({ vital_type: "blood_pressure_systolic", value: Number(inputValues.bp_systolic), unit: "mmHg" });
    }
    if (inputValues.bp_diastolic) {
      newEntry.bp_diastolic = Number(inputValues.bp_diastolic);
      records.push({ vital_type: "blood_pressure_diastolic", value: Number(inputValues.bp_diastolic), unit: "mmHg" });
    }
    if (inputValues.heart_rate) {
      newEntry.heart_rate = Number(inputValues.heart_rate);
      records.push({ vital_type: "heart_rate", value: Number(inputValues.heart_rate), unit: "bpm" });
    }
    if (inputValues.blood_glucose) {
      newEntry.blood_glucose = Number(inputValues.blood_glucose);
      records.push({ vital_type: "blood_glucose", value: Number(inputValues.blood_glucose), unit: "mg/dL" });
    }
    if (inputValues.body_weight) {
      newEntry.body_weight = Number(inputValues.body_weight);
      records.push({ vital_type: "body_weight", value: Number(inputValues.body_weight), unit: "kg" });
    }
    if (inputValues.body_temp) {
      newEntry.body_temp = Number(inputValues.body_temp);
      records.push({ vital_type: "body_temperature", value: Number(inputValues.body_temp), unit: "℃" });
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
          const th = VITAL_THRESHOLDS[r.vital_type.replace("blood_pressure_", "bp_") as keyof typeof VITAL_THRESHOLDS];
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
    } catch {
      /* demo mode */
    }

    setData((prev) => {
      const existing = prev.findIndex((e) => e.date === today);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], ...newEntry };
        return updated;
      }
      return [...prev, newEntry];
    });

    setShowInput(false);
    setInputValues({ bp_systolic: "", bp_diastolic: "", heart_rate: "", blood_glucose: "", body_weight: "", body_temp: "" });
  }

  const latest = data[data.length - 1];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">健康データ</h1>
          <p className="text-sm text-muted-foreground mt-1">過去30日間のバイタルデータ推移</p>
        </div>
        <Button onClick={() => setShowInput(!showInput)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" /> バイタル記録
        </Button>
      </div>

      {showInput && (
        <Card className="border-indigo-300 bg-indigo-50/30">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium">バイタルデータを入力</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">血圧（上）mmHg</Label>
                <Input
                  type="number"
                  placeholder="132"
                  value={inputValues.bp_systolic}
                  onChange={(e) => setInputValues({ ...inputValues, bp_systolic: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">血圧（下）mmHg</Label>
                <Input
                  type="number"
                  placeholder="84"
                  value={inputValues.bp_diastolic}
                  onChange={(e) => setInputValues({ ...inputValues, bp_diastolic: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">心拍数 bpm</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={inputValues.heart_rate}
                  onChange={(e) => setInputValues({ ...inputValues, heart_rate: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">血糖値 mg/dL</Label>
                <Input
                  type="number"
                  placeholder="105"
                  value={inputValues.blood_glucose}
                  onChange={(e) => setInputValues({ ...inputValues, blood_glucose: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">体重 kg</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="68.5"
                  value={inputValues.body_weight}
                  onChange={(e) => setInputValues({ ...inputValues, body_weight: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">体温 ℃</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="36.4"
                  value={inputValues.body_temp}
                  onChange={(e) => setInputValues({ ...inputValues, body_temp: e.target.value })}
                />
              </div>
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Activity, label: "血圧", value: latest?.bp_systolic && latest?.bp_diastolic ? `${latest.bp_systolic}/${latest.bp_diastolic}` : "-", unit: "mmHg", color: "text-red-500", threshold: VITAL_THRESHOLDS.bp_systolic, raw: latest?.bp_systolic },
          { icon: HeartPulse, label: "心拍", value: latest?.heart_rate || "-", unit: "bpm", color: "text-pink-500", threshold: VITAL_THRESHOLDS.heart_rate, raw: latest?.heart_rate },
          { icon: Droplets, label: "血糖", value: latest?.blood_glucose || "-", unit: "mg/dL", color: "text-blue-500", threshold: VITAL_THRESHOLDS.blood_glucose, raw: latest?.blood_glucose },
          { icon: Weight, label: "体重", value: latest?.body_weight || "-", unit: "kg", color: "text-green-500" },
        ].map((v) => {
          const isAbnormal = v.threshold && v.raw && (v.raw > v.threshold.high || v.raw < v.threshold.low);
          return (
            <Card key={v.label} className={isAbnormal ? "border-red-300 bg-red-50/30" : ""}>
              <CardContent className="p-3 text-center">
                <v.icon size={18} className={`${v.color} mx-auto mb-1`} />
                <p className="text-lg font-bold">{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label} ({v.unit})</p>
                {isAbnormal && (
                  <Badge variant="destructive" className="text-xs mt-1">
                    <AlertCircle size={10} className="mr-1" /> 異常値
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity size={16} className="text-red-500" /> 血圧推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart data={data} dataKey="bp_systolic" color="#ef4444" threshold={VITAL_THRESHOLDS.bp_systolic} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse size={16} className="text-pink-500" /> 心拍数推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart data={data} dataKey="heart_rate" color="#ec4899" threshold={VITAL_THRESHOLDS.heart_rate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets size={16} className="text-blue-500" /> 血糖値推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart data={data} dataKey="blood_glucose" color="#3b82f6" threshold={VITAL_THRESHOLDS.blood_glucose} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Weight size={16} className="text-green-500" /> 体重推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart data={data} dataKey="body_weight" color="#22c55e" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
