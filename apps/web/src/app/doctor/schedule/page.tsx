"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Trash2, Save, Video, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ScheduleSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

interface TodayAppointment {
  id: string;
  patient_name: string;
  appointment_type: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const DEMO_SCHEDULE: ScheduleSlot[] = [
  { id: "s1", day_of_week: 1, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 15, is_active: true },
  { id: "s2", day_of_week: 1, start_time: "14:00", end_time: "17:00", slot_duration_minutes: 15, is_active: true },
  { id: "s3", day_of_week: 2, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 15, is_active: true },
  { id: "s4", day_of_week: 3, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 15, is_active: true },
  { id: "s5", day_of_week: 3, start_time: "14:00", end_time: "17:00", slot_duration_minutes: 15, is_active: true },
  { id: "s6", day_of_week: 4, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 15, is_active: true },
  { id: "s7", day_of_week: 5, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 15, is_active: true },
  { id: "s8", day_of_week: 5, start_time: "14:00", end_time: "17:00", slot_duration_minutes: 15, is_active: true },
];

const DEMO_TODAY: TodayAppointment[] = [
  { id: "t1", patient_name: "山田 太郎", appointment_type: "online_followup", status: "scheduled", scheduled_at: new Date().toISOString().split("T")[0] + "T09:00:00", duration_minutes: 15 },
  { id: "t2", patient_name: "田中 花子", appointment_type: "online_initial", status: "scheduled", scheduled_at: new Date().toISOString().split("T")[0] + "T09:30:00", duration_minutes: 30 },
  { id: "t3", patient_name: "鈴木 次郎", appointment_type: "in_person_followup", status: "completed", scheduled_at: new Date().toISOString().split("T")[0] + "T10:00:00", duration_minutes: 15 },
  { id: "t4", patient_name: "高橋 美咲", appointment_type: "online_followup", status: "scheduled", scheduled_at: new Date().toISOString().split("T")[0] + "T10:30:00", duration_minutes: 15 },
  { id: "t5", patient_name: "渡辺 健一", appointment_type: "pre_consultation", status: "scheduled", scheduled_at: new Date().toISOString().split("T")[0] + "T11:00:00", duration_minutes: 15 },
];

export default function DoctorSchedulePage() {
  const [tab, setTab] = useState<"today" | "manage">("today");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(DEMO_SCHEDULE);
  const [todayAppts] = useState<TodayAppointment[]>(DEMO_TODAY);
  const [editingSlot, setEditingSlot] = useState<Partial<ScheduleSlot> | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: scheduleData } = await supabase
          .from("doctor_schedules")
          .select("*")
          .eq("doctor_id", user.id)
          .eq("is_active", true);

        if (scheduleData && scheduleData.length > 0) {
          setSchedule(scheduleData);
        }
      } catch {
        /* use demo data */
      }
    }
    load();
  }, []);

  function addSlot() {
    setEditingSlot({
      day_of_week: 1,
      start_time: "09:00",
      end_time: "12:00",
      slot_duration_minutes: 15,
      is_active: true,
    });
  }

  function saveNewSlot() {
    if (!editingSlot) return;
    setSchedule((prev) => [
      ...prev,
      {
        id: "new-" + Date.now(),
        day_of_week: editingSlot.day_of_week || 1,
        start_time: editingSlot.start_time || "09:00",
        end_time: editingSlot.end_time || "12:00",
        slot_duration_minutes: editingSlot.slot_duration_minutes || 15,
        is_active: true,
      },
    ]);
    setEditingSlot(null);
  }

  function removeSlot(id: string) {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  }

  async function saveSchedule() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("doctor_schedules").delete().eq("doctor_id", user.id);
        await supabase.from("doctor_schedules").insert(
          schedule.map((s) => ({
            doctor_id: user.id,
            clinic_id: "00000000-0000-0000-0000-000000000001",
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            slot_duration_minutes: s.slot_duration_minutes,
            is_active: s.is_active,
          }))
        );
      }
    } catch {
      /* demo mode */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">スケジュール管理</h1>
        <p className="text-sm text-muted-foreground mt-1">予約受付枠と本日の予約を管理します</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "today" ? "default" : "outline"}
          onClick={() => setTab("today")}
          className={tab === "today" ? "bg-teal-600 hover:bg-teal-700" : ""}
        >
          <Calendar size={16} className="mr-2" /> 本日の予約
          <Badge className="ml-2 bg-white/20 text-white">{todayAppts.length}</Badge>
        </Button>
        <Button
          variant={tab === "manage" ? "default" : "outline"}
          onClick={() => setTab("manage")}
          className={tab === "manage" ? "bg-teal-600 hover:bg-teal-700" : ""}
        >
          <Clock size={16} className="mr-2" /> 枠設定
        </Button>
      </div>

      {tab === "today" && (
        <div className="space-y-3">
          {todayAppts.map((a) => {
            const time = new Date(a.scheduled_at).toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isOnline = a.appointment_type.startsWith("online") || a.appointment_type === "pre_consultation";
            return (
              <Card key={a.id} className={a.status === "completed" ? "opacity-60" : ""}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold">{time}</p>
                      <p className="text-xs text-muted-foreground">{a.duration_minutes}分</p>
                    </div>
                    <div className="border-l pl-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.patient_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {isOnline ? (
                            <>
                              <Video size={10} className="mr-1" /> オンライン
                            </>
                          ) : (
                            <>
                              <MapPin size={10} className="mr-1" /> 対面
                            </>
                          )}
                        </Badge>
                        {a.status === "completed" && <Badge variant="secondary">完了</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isOnline && a.status !== "completed" && (
                      <Link href={`/doctor/consultations/${a.id}/video`}>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                          <Video size={14} className="mr-1" /> 開始
                        </Button>
                      </Link>
                    )}
                    <Link href={`/doctor/patients/${a.id}`}>
                      <Button variant="outline" size="sm">
                        <User size={14} className="mr-1" /> 詳細
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {todayAppts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar size={40} className="mx-auto mb-3 opacity-50" />
              <p>本日の予約はありません</p>
            </div>
          )}
        </div>
      )}

      {tab === "manage" && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {DAY_NAMES.map((day, idx) => {
              const daySlots = schedule.filter((s) => s.day_of_week === idx);
              return (
                <Card key={idx} className={daySlots.length === 0 ? "opacity-50" : ""}>
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm text-center">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="bg-teal-50 rounded-lg p-2 text-xs group relative"
                      >
                        <p className="font-medium text-teal-700">
                          {slot.start_time}-{slot.end_time}
                        </p>
                        <p className="text-teal-600">{slot.slot_duration_minutes}分枠</p>
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {daySlots.length === 0 && <p className="text-xs text-center text-gray-400 py-2">休診</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {editingSlot && (
            <Card className="border-teal-300 bg-teal-50/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">新しい枠を追加</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">曜日</label>
                    <select
                      value={editingSlot.day_of_week}
                      onChange={(e) => setEditingSlot({ ...editingSlot, day_of_week: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    >
                      {DAY_NAMES.map((d, i) => (
                        <option key={i} value={i}>
                          {d}曜日
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">開始時間</label>
                    <input
                      type="time"
                      value={editingSlot.start_time}
                      onChange={(e) => setEditingSlot({ ...editingSlot, start_time: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">終了時間</label>
                    <input
                      type="time"
                      value={editingSlot.end_time}
                      onChange={(e) => setEditingSlot({ ...editingSlot, end_time: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">枠の長さ</label>
                    <select
                      value={editingSlot.slot_duration_minutes}
                      onChange={(e) => setEditingSlot({ ...editingSlot, slot_duration_minutes: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    >
                      <option value={10}>10分</option>
                      <option value={15}>15分</option>
                      <option value={20}>20分</option>
                      <option value={30}>30分</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={saveNewSlot} className="bg-teal-600 hover:bg-teal-700">
                    追加
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingSlot(null)}>
                    キャンセル
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addSlot}>
              <Plus size={16} className="mr-2" /> 枠を追加
            </Button>
            <Button onClick={saveSchedule} className="bg-teal-600 hover:bg-teal-700">
              <Save size={16} className="mr-2" /> {saved ? "保存しました！" : "スケジュールを保存"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
