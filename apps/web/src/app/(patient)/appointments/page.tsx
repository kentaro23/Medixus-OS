"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const appointments = [
  {
    id: "1",
    doctor: "佐藤 一郎",
    specialty: "内科",
    date: "2026-03-30",
    time: "10:00",
    duration: 15,
    type: "online" as const,
    status: "scheduled" as const,
    reason: "高血圧の経過観察",
  },
  {
    id: "2",
    doctor: "鈴木 花子",
    specialty: "糖尿病内科",
    date: "2026-04-05",
    time: "14:30",
    duration: 30,
    type: "in_person" as const,
    status: "scheduled" as const,
    reason: "HbA1c検査結果の説明",
  },
  {
    id: "3",
    doctor: "佐藤 一郎",
    specialty: "内科",
    date: "2026-03-15",
    time: "11:00",
    duration: 15,
    type: "online" as const,
    status: "completed" as const,
    reason: "血圧コントロール確認",
  },
];

const availableSlots = [
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:00", available: false },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "11:30", available: false },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: false },
];

const doctors = [
  { id: "1", name: "佐藤 一郎", specialty: "内科", available: true },
  { id: "2", name: "鈴木 花子", specialty: "糖尿病内科", available: true },
  { id: "3", name: "田中 健太", specialty: "循環器内科", available: false },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  scheduled: { label: "予約済み", class: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", class: "bg-green-100 text-green-700" },
  cancelled: { label: "キャンセル", class: "bg-gray-100 text-gray-500" },
};

export default function AppointmentsPage() {
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState<"online" | "in_person">("online");

  const filtered = appointments.filter((a) => {
    if (filter === "upcoming") return new Date(a.date) >= new Date();
    if (filter === "past") return new Date(a.date) < new Date();
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">予約管理</h1>
          <p className="text-muted-foreground text-sm mt-1">オンライン診療・対面診療の予約</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" /> 新規予約
        </Button>
      </div>

      <div className="flex gap-2">
        {(["all", "upcoming", "past"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? "bg-indigo-600" : ""}
          >
            {f === "all" ? "すべて" : f === "upcoming" ? "今後の予約" : "過去の予約"}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((apt) => (
          <Card key={apt.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-indigo-700">
                    {new Date(apt.date).getMonth() + 1}/{new Date(apt.date).getDate()}
                  </span>
                  <span className="text-[10px] text-indigo-500">{apt.time}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{apt.doctor} 先生</p>
                    <Badge className={statusConfig[apt.status].class}>
                      {statusConfig[apt.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{apt.specialty} | {apt.reason}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {apt.type === "online" ? <Video size={12} /> : <MapPin size={12} />}
                      {apt.type === "online" ? "オンライン" : "対面"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {apt.duration}分
                    </span>
                  </div>
                </div>
                {apt.status === "scheduled" && new Date(apt.date) >= new Date() && (
                  <div className="flex gap-2">
                    {apt.type === "online" && (
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Video size={14} className="mr-1" /> 入室
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                      キャンセル
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新規予約</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>診療タイプ</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedType("online")}
                  className={`p-3 rounded-xl border-2 text-center transition-colors ${
                    selectedType === "online" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                  }`}
                >
                  <Video size={20} className="mx-auto mb-1 text-indigo-500" />
                  <p className="text-sm font-medium">オンライン診療</p>
                </button>
                <button
                  onClick={() => setSelectedType("in_person")}
                  className={`p-3 rounded-xl border-2 text-center transition-colors ${
                    selectedType === "in_person" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                  }`}
                >
                  <MapPin size={20} className="mx-auto mb-1 text-indigo-500" />
                  <p className="text-sm font-medium">対面診療</p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>医師を選択</Label>
              <div className="space-y-2">
                {doctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => doc.available && setSelectedDoctor(doc.id)}
                    disabled={!doc.available}
                    className={`w-full p-3 rounded-xl border text-left transition-colors flex items-center gap-3 ${
                      selectedDoctor === doc.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
                    } ${!doc.available ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>日時を選択</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              {selectedDate && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {availableSlots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setSelectedTime(s.time)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        selectedTime === s.time
                          ? "bg-indigo-600 text-white"
                          : s.available
                          ? "bg-gray-100 hover:bg-indigo-50 text-gray-700"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>受診理由</Label>
              <Input placeholder="例: 高血圧の経過観察" />
            </div>

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={!selectedDoctor || !selectedDate || !selectedTime}
            >
              予約を確定する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
