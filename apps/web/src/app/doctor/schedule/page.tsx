"use client";

import { useState } from "react";
import { Video, MapPin, Clock, User, CheckCircle2, AlertTriangle, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const timeSlots = Array.from({ length: 17 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const appointments = [
  { id: "1", patient: "山田 太郎", time: "10:00", endTime: "10:15", type: "online", status: "scheduled", reason: "高血圧 経過観察", age: 45 },
  { id: "2", patient: "田中 美咲", time: "10:30", endTime: "10:45", type: "online", status: "scheduled", reason: "糖尿病 フォロー", age: 62 },
  { id: "3", patient: "佐々木 健", time: "11:00", endTime: "11:30", type: "in_person", status: "waiting", reason: "腰痛", age: 50 },
  { id: "4", patient: "鈴木 あゆみ", time: "11:30", endTime: "11:45", type: "online", status: "scheduled", reason: "不眠症 相談", age: 28 },
  { id: "5", patient: "高橋 次郎", time: "14:00", endTime: "14:15", type: "online", status: "scheduled", reason: "高脂血症 経過", age: 55 },
  { id: "6", patient: "伊藤 真理", time: "14:30", endTime: "14:45", type: "online", status: "completed", reason: "片頭痛 フォロー", age: 38 },
  { id: "7", patient: "渡辺 翔太", time: "15:00", endTime: "15:30", type: "in_person", status: "scheduled", reason: "健診結果 説明", age: 42 },
  { id: "8", patient: "中村 さくら", time: "15:30", endTime: "15:45", type: "online", status: "scheduled", reason: "花粉症", age: 33 },
];

const statusBg: Record<string, string> = {
  scheduled: "bg-blue-50 border-blue-200",
  waiting: "bg-amber-50 border-amber-200",
  in_progress: "bg-green-50 border-green-200",
  completed: "bg-gray-50 border-gray-200 opacity-50",
};

export default function SchedulePage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">本日のスケジュール</h1>
          <p className="text-muted-foreground text-sm mt-1">2026年3月28日（土）</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm"><ChevronLeft size={16} /></Button>
          <span className="text-sm font-medium">今日</span>
          <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "予約総数", value: appointments.length, color: "bg-blue-50 text-blue-700" },
          { label: "オンライン", value: appointments.filter((a) => a.type === "online").length, color: "bg-indigo-50 text-indigo-700" },
          { label: "対面", value: appointments.filter((a) => a.type === "in_person").length, color: "bg-teal-50 text-teal-700" },
          { label: "完了", value: appointments.filter((a) => a.status === "completed").length, color: "bg-green-50 text-green-700" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {appointments.map((apt) => (
              <div key={apt.id} className={`flex items-center gap-4 p-4 border rounded-xl ${statusBg[apt.status]}`}>
                <div className="w-16 text-center shrink-0">
                  <p className="text-sm font-bold">{apt.time}</p>
                  <p className="text-[10px] text-muted-foreground">~{apt.endTime}</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{apt.patient}</p>
                    <span className="text-xs text-muted-foreground">{apt.age}歳</span>
                    <Badge variant="outline" className="text-xs">
                      {apt.type === "online" ? <><Video size={10} className="mr-1" />オンライン</> : <><MapPin size={10} className="mr-1" />対面</>}
                    </Badge>
                    {apt.status === "waiting" && (
                      <Badge className="bg-amber-500 text-white text-xs">
                        <AlertTriangle size={10} className="mr-1" /> 待機中
                      </Badge>
                    )}
                    {apt.status === "completed" && (
                      <Badge className="bg-gray-200 text-gray-600 text-xs">
                        <CheckCircle2 size={10} className="mr-1" /> 完了
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{apt.reason}</p>
                </div>
                {apt.status !== "completed" && (
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Play size={12} className="mr-1" /> 開始
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
