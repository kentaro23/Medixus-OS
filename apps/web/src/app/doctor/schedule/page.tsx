"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Trash2, Save, Video, MapPin, User, CheckCircle2, AlertCircle } from "lucide-react";
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
  status: "scheduled" | "completed" | "cancelled" | "no_show";
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
  { id: "t1", patient_name: "山田 太郎", appointment_type: "online_followup", status: "completed", scheduled_at: new Date().toISOString().split("T")[0] + "T09:00:00", duration_minutes: 15 },
  { id: "t2", patient_name: "田中 花子", appointment_type: "online_initial", status: "completed", scheduled_at: new Date().toISOString().split("T")[0] + "T09:30:00", duration_minutes: 30 },
  { id: "t3", patient_name: "鈴木 次郎", appointment_type: "in_person_followup", status: "scheduled", scheduled_at: new Date().toISOString().split("T")[0] + "T10:30:00", duration_minutes: 15 },
  { id: "t4", patient_name: "高橋 美咲", appointment_type: "online_followup", status: "scheduled", scheduled_at: new Date().toISOString().split("T")[0] + "T11:00:00", duration_minutes: 15 },
  { id: "t5", patient_name: "渡辺 健一", appointment_type: "pre_consultation", status: "scheduled", scheduled_at: new Date().toISOString().split("T")[0] + "T11:30:00", duration_minutes: 15 },
  { id: "t6", patient_name: "佐々木 優", appointment_type: "online_followup", status: "no_show", scheduled_at: new Date().toISOString().split("T")[0] + "T10:00:00", duration_minutes: 15 },
];

const TYPE_LABELS: Record<string, string> = {
  online_initial: "オンライン初診",
  online_followup: "オンライン再診",
  in_person_initial: "対面初診",
  in_person_followup: "対面再診",
  pre_consultation: "診療前相談",
  self_pay: "自費診療",
};

function slotCount(slot: ScheduleSlot): number {
  const [sh, sm] = slot.start_time.split(":").map(Number);
  const [eh, em] = slot.end_time.split(":").map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / slot.slot_duration_minutes;
}

export default function DoctorSchedulePage() {
  const [tab, setTab] = useState<"today" | "manage">("today");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(DEMO_SCHEDULE);
  const [todayAppts, setTodayAppts] = useState<TodayAppointment[]>(DEMO_TODAY);
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
        if (scheduleData && scheduleData.length > 0) setSchedule(scheduleData);
      } catch { /* use demo data */ }
    }
    load();
  }, []);

  function addSlot() {
    setEditingSlot({ day_of_week: 1, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 15, is_active: true });
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

  function markStatus(id: string, status: TodayAppointment["status"]) {
    setTodayAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
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
    } catch { /* demo mode */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const completedCount = todayAppts.filter((a) => a.status === "completed").length;
  const scheduledCount = todayAppts.filter((a) => a.status === "scheduled").length;
  const noShowCount = todayAppts.filter((a) => a.status === "no_show").length;
  const totalSlots = schedule.reduce((sum, s) => sum + slotCount(s), 0);

  const now = new Date();
  const sortedAppts = [...todayAppts].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );

  const nextAppt = sortedAppts.find(
    (a) => a.status === "scheduled" && new Date(a.scheduled_at) >= now
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">スケジュール管理</h1>
        <p className="text-sm text-muted-foreground mt-1">予約受付枠と本日の診察を管理します</p>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-teal-700">{todayAppts.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">本日予約数</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{completedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">診察完了</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{scheduledCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">残り予約</p>
        </div>
        <div className={`${noShowCount > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"} border rounded-xl p-3 text-center`}>
          <p className={`text-2xl font-bold ${noShowCount > 0 ? "text-red-600" : "text-gray-400"}`}>{noShowCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">不在</p>
        </div>
      </div>

      {/* Next Appointment Banner */}
      {nextAppt && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
            <Calendar size={18} className="text-teal-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-teal-700">次の予約</p>
            <p className="text-sm text-teal-600">
              {new Date(nextAppt.scheduled_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} ·{" "}
              {nextAppt.patient_name} ({TYPE_LABELS[nextAppt.appointment_type] || nextAppt.appointment_type})
            </p>
          </div>
          {nextAppt.appointment_type.startsWith("online") && (
            <Link href={`/doctor/consultations/${nextAppt.id}/video`}>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Video size={14} className="mr-1" /> 開始
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === "today" ? "default" : "outline"}
          onClick={() => setTab("today")}
          className={tab === "today" ? "bg-teal-600 hover:bg-teal-700" : ""}
        >
          <Calendar size={16} className="mr-2" /> 本日の予約
          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === "today" ? "bg-white/20" : "bg-teal-100 text-teal-700"}`}>
            {todayAppts.length}
          </span>
        </Button>
        <Button
          variant={tab === "manage" ? "default" : "outline"}
          onClick={() => setTab("manage")}
          className={tab === "manage" ? "bg-teal-600 hover:bg-teal-700" : ""}
        >
          <Clock size={16} className="mr-2" /> 受付枠設定
        </Button>
      </div>

      {/* Today's Appointments */}
      {tab === "today" && (
        <div className="space-y-2">
          {sortedAppts.map((a) => {
            const time = new Date(a.scheduled_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
            const isOnline = a.appointment_type.startsWith("online") || a.appointment_type === "pre_consultation";
            const isPast = new Date(a.scheduled_at) < now;
            const isNext = nextAppt?.id === a.id;

            return (
              <Card
                key={a.id}
                className={`transition-all ${
                  a.status === "completed" ? "opacity-60 bg-gray-50" :
                  a.status === "no_show" ? "opacity-60 bg-red-50/50 border-red-100" :
                  isNext ? "border-teal-300 shadow-sm" :
                  "hover:shadow-sm"
                }`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Time */}
                  <div className="min-w-[56px] text-center shrink-0">
                    <p className={`text-base font-bold ${isNext ? "text-teal-700" : ""}`}>{time}</p>
                    <p className="text-xs text-muted-foreground">{a.duration_minutes}分</p>
                  </div>

                  {/* Info */}
                  <div className="border-l pl-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{a.patient_name}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${isOnline ? "border-indigo-200 text-indigo-600" : "border-teal-200 text-teal-600"}`}
                      >
                        {isOnline ? <Video size={10} className="mr-1 inline" /> : <MapPin size={10} className="mr-1 inline" />}
                        {TYPE_LABELS[a.appointment_type] || a.appointment_type}
                      </Badge>
                      {a.status === "completed" && (
                        <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs">完了</Badge>
                      )}
                      {a.status === "no_show" && (
                        <Badge className="bg-red-100 text-red-600 border border-red-200 text-xs">不在</Badge>
                      )}
                      {isNext && (
                        <Badge className="bg-teal-100 text-teal-700 border border-teal-200 text-xs animate-pulse">次の予約</Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {a.status === "scheduled" && isOnline && (
                      <Link href={`/doctor/consultations/${a.id}/video`}>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                          <Video size={14} className="mr-1" /> 開始
                        </Button>
                      </Link>
                    )}
                    {a.status === "scheduled" && !isOnline && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => markStatus(a.id, "completed")}
                      >
                        <CheckCircle2 size={14} className="mr-1" /> 完了
                      </Button>
                    )}
                    {a.status === "scheduled" && isPast && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => markStatus(a.id, "no_show")}
                      >
                        <AlertCircle size={14} className="mr-1" /> 不在
                      </Button>
                    )}
                    <Link href={`/doctor/patients/${a.id}`}>
                      <Button variant="outline" size="sm">
                        <User size={14} className="mr-1" /> カルテ
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {todayAppts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p>本日の予約はありません</p>
            </div>
          )}

          {/* Today Summary */}
          {todayAppts.length > 0 && (
            <div className="pt-2">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                <div
                  className="h-full bg-green-500 rounded-l-full transition-all"
                  style={{ width: `${(completedCount / todayAppts.length) * 100}%` }}
                />
                <div
                  className="h-full bg-red-300 transition-all"
                  style={{ width: `${(noShowCount / todayAppts.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>完了 {completedCount}</span>
                <span>残り {scheduledCount}</span>
                <span>不在 {noShowCount}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Management */}
      {tab === "manage" && (
        <div className="space-y-4">
          {/* Weekly capacity summary */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-center gap-3">
            <Clock size={16} className="text-teal-600" />
            <p className="text-sm text-teal-700">
              週間受付枠合計:{" "}
              <span className="font-bold">{totalSlots}枠</span>
              <span className="text-teal-600 ml-2">
                ({schedule.filter((s) => s.is_active).length}セッション)
              </span>
            </p>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DAY_NAMES.map((day, idx) => {
              const daySlots = schedule.filter((s) => s.day_of_week === idx);
              const dayTotal = daySlots.reduce((sum, s) => sum + slotCount(s), 0);
              const isToday = new Date().getDay() === idx;
              return (
                <Card
                  key={idx}
                  className={`${daySlots.length === 0 ? "opacity-50" : ""} ${isToday ? "border-teal-300" : ""}`}
                >
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className={`text-sm text-center ${isToday ? "text-teal-700 font-bold" : ""}`}>
                      {day}
                      {isToday && <span className="block text-[10px] text-teal-500">今日</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="bg-teal-50 border border-teal-100 rounded-lg p-2 text-xs group relative">
                        <p className="font-medium text-teal-700">{slot.start_time}–{slot.end_time}</p>
                        <p className="text-teal-600">{slot.slot_duration_minutes}分/{slotCount(slot)}枠</p>
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                    {daySlots.length === 0 && (
                      <p className="text-xs text-center text-gray-400 py-2">休診</p>
                    )}
                    {dayTotal > 0 && (
                      <p className="text-[10px] text-center text-muted-foreground">{dayTotal}枠</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {editingSlot && (
            <Card className="border-teal-300 bg-teal-50/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">新しい受付枠を追加</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">曜日</label>
                    <select
                      value={editingSlot.day_of_week}
                      onChange={(e) => setEditingSlot({ ...editingSlot, day_of_week: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-white"
                    >
                      {DAY_NAMES.map((d, i) => (
                        <option key={i} value={i}>{d}曜日</option>
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
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-white"
                    >
                      <option value={10}>10分</option>
                      <option value={15}>15分</option>
                      <option value={20}>20分</option>
                      <option value={30}>30分</option>
                    </select>
                  </div>
                </div>
                {editingSlot.start_time && editingSlot.end_time && (
                  <p className="text-xs text-teal-600 mt-2">
                    → 予定枠数: {slotCount({
                      start_time: editingSlot.start_time,
                      end_time: editingSlot.end_time,
                      slot_duration_minutes: editingSlot.slot_duration_minutes || 15,
                    } as ScheduleSlot)}枠
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={saveNewSlot} className="bg-teal-600 hover:bg-teal-700">追加</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingSlot(null)}>キャンセル</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addSlot}>
              <Plus size={16} className="mr-2" /> 枠を追加
            </Button>
            <Button onClick={saveSchedule} className="bg-teal-600 hover:bg-teal-700">
              {saved ? (
                <>
                  <CheckCircle2 size={16} className="mr-2" /> 保存しました
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" /> スケジュールを保存
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
