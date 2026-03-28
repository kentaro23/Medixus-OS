"use client";

import { useState } from "react";
import {
  Activity,
  HeartPulse,
  Droplets,
  Weight,
  Thermometer,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const bpHistory = [
  { date: "3/22", systolic: 128, diastolic: 82 },
  { date: "3/23", systolic: 135, diastolic: 88 },
  { date: "3/24", systolic: 130, diastolic: 85 },
  { date: "3/25", systolic: 142, diastolic: 92 },
  { date: "3/26", systolic: 138, diastolic: 86 },
  { date: "3/27", systolic: 132, diastolic: 84 },
  { date: "3/28", systolic: 136, diastolic: 87 },
];

const glucoseHistory = [
  { date: "3/22", fasting: 105, postMeal: 145 },
  { date: "3/23", fasting: 112, postMeal: 158 },
  { date: "3/24", fasting: 108, postMeal: 140 },
  { date: "3/25", fasting: 118, postMeal: 165 },
  { date: "3/26", fasting: 110, postMeal: 148 },
  { date: "3/27", fasting: 115, postMeal: 155 },
  { date: "3/28", fasting: 118, postMeal: 160 },
];

const weightHistory = [
  { date: "3/1", weight: 74.2 },
  { date: "3/8", weight: 73.8 },
  { date: "3/15", weight: 73.5 },
  { date: "3/22", weight: 73.7 },
  { date: "3/28", weight: 73.5 },
];

export default function HealthPage() {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">健康データ</h1>
          <p className="text-muted-foreground text-sm mt-1">バイタルの記録・推移を確認</p>
        </div>
        <Button onClick={() => setShowInput(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" /> バイタル入力
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "血圧", value: "132/84", unit: "mmHg", icon: Activity, trend: "up", color: "red" },
          { label: "心拍数", value: "72", unit: "bpm", icon: HeartPulse, trend: "stable", color: "pink" },
          { label: "血糖値(空腹時)", value: "118", unit: "mg/dL", icon: Droplets, trend: "up", color: "blue" },
          { label: "体重", value: "73.5", unit: "kg", icon: Weight, trend: "down", color: "green" },
        ].map((v) => (
          <Card key={v.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 bg-${v.color}-50 rounded-lg`}>
                  <v.icon size={16} className={`text-${v.color}-500`} />
                </div>
                <span className="text-xs text-muted-foreground">{v.label}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{v.value}</span>
                <span className="text-xs text-muted-foreground mb-1">{v.unit}</span>
                {v.trend === "up" && <TrendingUp size={14} className="text-red-500 mb-1 ml-auto" />}
                {v.trend === "down" && <TrendingDown size={14} className="text-green-500 mb-1 ml-auto" />}
                {v.trend === "stable" && <Minus size={14} className="text-gray-400 mb-1 ml-auto" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bp">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bp">血圧</TabsTrigger>
          <TabsTrigger value="glucose">血糖値</TabsTrigger>
          <TabsTrigger value="weight">体重</TabsTrigger>
        </TabsList>

        <TabsContent value="bp">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">血圧推移（7日間）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bpHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis domain={[60, 160]} fontSize={12} />
                    <Tooltip />
                    <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label="高血圧基準" />
                    <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="収縮期" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="拡張期" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="glucose">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">血糖値推移（7日間）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={glucoseHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis domain={[80, 200]} fontSize={12} />
                    <Tooltip />
                    <ReferenceLine y={126} stroke="#ef4444" strokeDasharray="3 3" label="空腹時基準" />
                    <Line type="monotone" dataKey="fasting" stroke="#3b82f6" strokeWidth={2} name="空腹時" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="postMeal" stroke="#f59e0b" strokeWidth={2} name="食後" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weight">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">体重推移（1ヶ月）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis domain={[72, 75]} fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} name="体重(kg)" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showInput} onOpenChange={setShowInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>バイタル入力</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>収縮期血圧 (mmHg)</Label>
                <Input type="number" placeholder="130" />
              </div>
              <div className="space-y-2">
                <Label>拡張期血圧 (mmHg)</Label>
                <Input type="number" placeholder="85" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>心拍数 (bpm)</Label>
                <Input type="number" placeholder="72" />
              </div>
              <div className="space-y-2">
                <Label>体温 (°C)</Label>
                <Input type="number" step="0.1" placeholder="36.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>血糖値 (mg/dL)</Label>
                <Input type="number" placeholder="110" />
              </div>
              <div className="space-y-2">
                <Label>体重 (kg)</Label>
                <Input type="number" step="0.1" placeholder="73.5" />
              </div>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowInput(false)}>
              記録する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
