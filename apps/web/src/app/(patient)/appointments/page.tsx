"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  User,
  Stethoscope,
  X,
  Bell,
  CheckSquare,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type AppointmentType =
  | "online_initial"
  | "online_followup"
  | "in_person_initial"
  | "in_person_followup"
  | "pre_consultation"
  | "self_pay";

interface Doctor {
  id: string;
  name: string;
  specialties: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Appointment {
  id: string;
  doctor_name: string;
  appointment_type: AppointmentType;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  clinic_name?: string;
}

const TYPE_LABELS: Record<AppointmentType, { label: string; icon: typeof Video; color: string }> = {
  online_initial: { label: "オンライン初診", icon: Video, color: "text-indigo-600" },
  online_followup: { label: "オンライン再診", icon: Video, color: "text-indigo-600" },
  in_person_initial: { label: "対面初診", icon: MapPin, color: "text-teal-600" },
  in_person_followup: { label: "対面再診", icon: MapPin, color: "text-teal-600" },
  pre_consultation: { label: "診療前相談", icon: Stethoscope, color: "text-purple-600" },
  self_pay: { label: "自費診療", icon: Stethoscope, color: "text-orange-600" },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: { label: "予約済", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  waiting: { label: "待機中", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  in_progress: { label: "診察中", className: "bg-teal-100 text-teal-700 border-teal-200" },
  completed: { label: "完了", className: "bg-gray-100 text-gray-600 border-gray-200" },
  cancelled: { label: "キャンセル", className: "bg-red-100 text-red-600 border-red-200" },
  no_show: { label: "不在", className: "bg-red-100 text-red-600 border-red-200" },
};

const PRE_CHECKLIST = [
  "保険証（または保険証番号）を準備してください",
  "過去の診断書・処方箋があれば用意してください",
  "現在服用中の薬のリストを確認してください",
  "アレルギー情報を確認してください",
  "症状の経過・期間をメモしてください",
];

const DEMO_DOCTORS: Doctor[] = [
  { id: "d1", name: "佐藤 一郎", specialties: ["内科", "循環器内科"] },
  { id: "d2", name: "鈴木 花子", specialties: ["皮膚科", "アレルギー科"] },
];

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    doctor_name: "佐藤 一郎",
    appointment_type: "online_followup",
    status: "scheduled",
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    duration_minutes: 15,
    clinic_name: "Medixusクリニック渋谷",
  },
  {
    id: "a2",
    doctor_name: "鈴木 花子",
    appointment_type: "online_initial",
    status: "completed",
    scheduled_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    duration_minutes: 30,
    clinic_name: "Medixusクリニック渋谷",
  },
];

function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 9; h < 18; h++) {
    if (h === 12 || h === 13) continue;
    for (const m of [0, 15, 30, 45]) {
      slots.push({
        time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        available: Math.random() > 0.4,
      });
    }
  }
  return slots;
}

function getDaysInWeek(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function CountdownBadge({ scheduledAt }: { scheduledAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const diff = new Date(scheduledAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("まもなく"); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) setTimeLeft(`${days}日後`);
      else if (hours > 0) setTimeLeft(`${hours}時間${mins}分後`);
      else setTimeLeft(`${mins}分後`);
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [scheduledAt]);

  return (
    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
      {timeLeft}
    </span>
  );
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "book">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [doctors] = useState<Doctor[]>(DEMO_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType>("online_followup");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookingStep, setBookingStep] = useState(0);
  const [booked, setBooked] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [checklistDone, setChecklistDone] = useState<Set<number>>(new Set());
  const [showChecklist, setShowChecklist] = useState<string | null>(null);

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getDaysInWeek(baseDate);

  const loadAppointments = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("appointments")
        .select("*, doctors!inner(profiles!inner(display_name)), clinics(name)")
        .eq("patient_id", user.id)
        .order("scheduled_at", { ascending: false })
        .limit(20);
      if (data && data.length > 0) {
        setAppointments(
          data.map((a: Record<string, unknown>) => ({
            id: a.id as string,
            doctor_name: ((a.doctors as Record<string, unknown>)?.profiles as Record<string, string>)?.display_name || "医師",
            appointment_type: a.appointment_type as AppointmentType,
            status: a.status as string,
            scheduled_at: a.scheduled_at as string,
            duration_minutes: (a.duration_minutes as number) || 15,
            clinic_name: (a.clinics as Record<string, string>)?.name,
          }))
        );
      }
    } catch {
      /* use demo data */
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  function selectDate(d: Date) {
    setSelectedDate(d);
    setSlots(generateTimeSlots());
    setSelectedTime(null);
  }

  async function handleBook() {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const scheduledAt = new Date(selectedDate);
        const [h, m] = selectedTime.split(":").map(Number);
        scheduledAt.setHours(h, m, 0, 0);
        await supabase.from("appointments").insert({
          patient_id: user.id,
          doctor_id: selectedDoctor.id,
          clinic_id: "00000000-0000-0000-0000-000000000001",
          appointment_type: selectedType,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 15,
          status: "scheduled",
        });
      }
    } catch { /* demo mode */ }
    setBooked(true);
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setAppointments((prev) =>
      prev.map((a) => (a.id === cancelTarget.id ? { ...a, status: "cancelled" } : a))
    );
    try {
      const supabase = createClient();
      await supabase
        .from("appointments")
        .update({ status: "cancelled", cancellation_reason: cancelReason })
        .eq("id", cancelTarget.id);
    } catch { /* demo mode */ }
    setCancelTarget(null);
    setCancelReason("");
  }

  const upcomingAppts = appointments.filter(
    (a) => a.status === "scheduled" && new Date(a.scheduled_at) > new Date()
  );
  const pastAppts = appointments.filter(
    (a) => a.status !== "scheduled" || new Date(a.scheduled_at) <= new Date()
  );

  const nextAppt = upcomingAppts.sort((a, b) =>
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )[0];

  const isWithin24h = nextAppt &&
    new Date(nextAppt.scheduled_at).getTime() - Date.now() < 86400000 * 2;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">予約管理</h1>
        <p className="text-sm text-muted-foreground mt-1">オンライン診療・対面診療の予約を管理します</p>
      </div>

      {/* Next Appointment Banner */}
      {nextAppt && (
        <div className={`rounded-2xl p-4 border ${isWithin24h ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isWithin24h ? "bg-indigo-100" : "bg-gray-100"}`}>
              <Bell size={18} className={isWithin24h ? "text-indigo-600" : "text-gray-400"} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {isWithin24h ? "まもなく診察です" : "次回の予約"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(nextAppt.scheduled_at).toLocaleString("ja-JP", {
                  month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
                })} · {nextAppt.doctor_name} 先生
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CountdownBadge scheduledAt={nextAppt.scheduled_at} />
              {isWithin24h && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 hover:bg-indigo-100"
                  onClick={() => setShowChecklist(nextAppt.id)}
                >
                  <CheckSquare size={14} className="mr-1" /> 準備チェック
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pre-appointment Checklist Modal */}
      {showChecklist && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare size={18} className="text-indigo-600" />
                  診察前チェックリスト
                </CardTitle>
                <button onClick={() => setShowChecklist(null)}>
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRE_CHECKLIST.map((item, i) => (
                <label key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-indigo-600 mt-0.5"
                    checked={checklistDone.has(i)}
                    onChange={() => {
                      setChecklistDone((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      });
                    }}
                  />
                  <span className={`text-sm ${checklistDone.has(i) ? "line-through text-muted-foreground" : ""}`}>
                    {item}
                  </span>
                </label>
              ))}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>準備状況</span>
                  <span>{checklistDone.size}/{PRE_CHECKLIST.length}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${(checklistDone.size / PRE_CHECKLIST.length) * 100}%` }}
                  />
                </div>
              </div>
              <Button
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowChecklist(null)}
              >
                完了
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base text-red-600 flex items-center gap-2">
                <X size={18} /> 予約キャンセルの確認
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <p className="font-medium">{cancelTarget.doctor_name} 先生</p>
                <p className="text-muted-foreground">
                  {new Date(cancelTarget.scheduled_at).toLocaleString("ja-JP", {
                    month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">キャンセル理由（任意）</label>
                <textarea
                  className="w-full border rounded-lg p-2 mt-1 text-sm resize-none h-20"
                  placeholder="キャンセルの理由を入力..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setCancelTarget(null)}>
                  戻る
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  キャンセルを確定
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === "upcoming" ? "default" : "outline"}
          onClick={() => setTab("upcoming")}
          className={tab === "upcoming" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
        >
          <Calendar size={16} className="mr-2" /> 予約一覧
          {upcomingAppts.length > 0 && (
            <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{upcomingAppts.length}</span>
          )}
        </Button>
        <Button
          variant={tab === "book" ? "default" : "outline"}
          onClick={() => { setTab("book"); setBookingStep(0); setBooked(false); }}
          className={tab === "book" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
        >
          <Clock size={16} className="mr-2" /> 新しい予約
        </Button>
      </div>

      {tab === "upcoming" && (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcomingAppts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">今後の予約</h2>
              <div className="space-y-3">
                {upcomingAppts
                  .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                  .map((a) => {
                    const typeInfo = TYPE_LABELS[a.appointment_type] || TYPE_LABELS.online_followup;
                    const isToday = new Date(a.scheduled_at).toDateString() === new Date().toDateString();
                    const canCancel = new Date(a.scheduled_at).getTime() - Date.now() > 86400000;
                    return (
                      <Card
                        key={a.id}
                        className={`transition-all hover:shadow-md ${isToday ? "border-indigo-300 bg-indigo-50/30" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              typeInfo.color.includes("indigo") ? "bg-indigo-100" :
                              typeInfo.color.includes("teal") ? "bg-teal-100" :
                              typeInfo.color.includes("purple") ? "bg-purple-100" : "bg-orange-100"
                            }`}>
                              <typeInfo.icon size={20} className={typeInfo.color} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-medium">{typeInfo.label}</span>
                                <Badge className={`${STATUS_CONFIG[a.status]?.className} border text-xs`}>
                                  {STATUS_CONFIG[a.status]?.label || a.status}
                                </Badge>
                                {isToday && (
                                  <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-xs">本日</Badge>
                                )}
                                <CountdownBadge scheduledAt={a.scheduled_at} />
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {a.doctor_name} 先生 · {a.clinic_name || "Medixusクリニック"}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(a.scheduled_at).toLocaleString("ja-JP", {
                                  month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
                                })} ({a.duration_minutes}分)
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {a.appointment_type.startsWith("online") && (
                              <Link href={`/appointments/${a.id}/video`}>
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                  <Video size={14} className="mr-1" /> 入室
                                </Button>
                              </Link>
                            )}
                            {a.appointment_type.startsWith("in_person") && (
                              <Button size="sm" variant="outline">
                                <MapPin size={14} className="mr-1" /> 場所を確認
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground"
                              onClick={() => setShowChecklist(a.id)}
                            >
                              <CheckSquare size={14} className="mr-1" /> 準備
                            </Button>
                            {canCancel && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:bg-red-50 ml-auto"
                                onClick={() => setCancelTarget(a)}
                              >
                                <X size={14} className="mr-1" /> キャンセル
                              </Button>
                            )}
                            {!canCancel && (
                              <p className="text-xs text-muted-foreground ml-auto self-center">24時間以内はキャンセル不可</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">過去の予約</h2>
              <div className="space-y-2">
                {pastAppts.map((a) => {
                  const typeInfo = TYPE_LABELS[a.appointment_type] || TYPE_LABELS.online_followup;
                  return (
                    <Card key={a.id} className="opacity-75 hover:opacity-100 transition-opacity">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <typeInfo.icon size={14} className="text-gray-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{typeInfo.label}</span>
                            <span className="text-sm text-gray-500 ml-2">{a.doctor_name} 先生</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${STATUS_CONFIG[a.status]?.className} border text-xs`}>
                              {STATUS_CONFIG[a.status]?.label || a.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {new Date(a.scheduled_at).toLocaleDateString("ja-JP")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {appointments.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium mb-2">予約はありません</p>
              <p className="text-sm mb-6">医師の診察を予約しましょう</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setTab("book")}>
                新しい予約を取る
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Booking Flow */}
      {tab === "book" && !booked && (
        <div className="space-y-6">
          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {[
              { step: 0, label: "診療タイプ" },
              { step: 1, label: "医師選択" },
              { step: 2, label: "日時選択" },
              { step: 3, label: "確認" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <button
                  onClick={() => bookingStep > s.step && setBookingStep(s.step)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    bookingStep > s.step ? "bg-indigo-600 text-white cursor-pointer" :
                    bookingStep === s.step ? "bg-indigo-600 text-white" :
                    "bg-gray-200 text-gray-500"
                  }`}
                >
                  {bookingStep > s.step ? <Check size={14} /> : s.step + 1}
                </button>
                <span className={`text-sm hidden sm:block ${bookingStep >= s.step ? "font-medium" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < 3 && <ChevronRight size={14} className="text-gray-300" />}
              </div>
            ))}
          </div>

          {/* Step 0: Type */}
          {bookingStep === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.entries(TYPE_LABELS) as [AppointmentType, typeof TYPE_LABELS[AppointmentType]][]).map(
                ([type, info]) => (
                  <Card
                    key={type}
                    className={`cursor-pointer transition-all ${
                      selectedType === type ? "ring-2 ring-indigo-500 bg-indigo-50" : "hover:shadow-sm hover:border-indigo-200"
                    }`}
                    onClick={() => { setSelectedType(type); setBookingStep(1); }}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center ${
                        selectedType === type ? "bg-indigo-100" : "bg-gray-100"
                      }`}>
                        <info.icon size={20} className={info.color} />
                      </div>
                      <p className="text-sm font-medium">{info.label}</p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}

          {/* Step 1: Doctor */}
          {bookingStep === 1 && (
            <div className="space-y-3">
              {doctors.map((d) => (
                <Card
                  key={d.id}
                  className={`cursor-pointer transition-all ${
                    selectedDoctor?.id === d.id ? "ring-2 ring-indigo-500 bg-indigo-50" : "hover:shadow-sm"
                  }`}
                  onClick={() => { setSelectedDoctor(d); setBookingStep(2); }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{d.name} 先生</p>
                      <p className="text-sm text-muted-foreground">{d.specialties.join("・")}</p>
                    </div>
                    {selectedDoctor?.id === d.id && <Check size={16} className="text-indigo-600" />}
                  </CardContent>
                </Card>
              ))}
              <Button variant="ghost" onClick={() => setBookingStep(0)}>
                <ChevronLeft size={16} className="mr-1" /> 戻る
              </Button>
            </div>
          )}

          {/* Step 2: Date/Time */}
          {bookingStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)} disabled={weekOffset <= 0}>
                  <ChevronLeft size={16} /> 前週
                </Button>
                <span className="font-medium">
                  {weekDays[0].toLocaleDateString("ja-JP", { month: "long" })} ·{" "}
                  <span className="text-sm text-muted-foreground">
                    {weekDays[0].getDate()}日〜{weekDays[6].getDate()}日
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
                  翌週 <ChevronRight size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
                  <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"}`}>
                    {d}
                  </div>
                ))}
                {weekDays.map((d, i) => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  const isPast = d < new Date() && !isToday;
                  const isSelected = selectedDate?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={d.toISOString()}
                      disabled={isPast}
                      onClick={() => selectDate(d)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        isSelected ? "bg-indigo-600 text-white font-bold" :
                        isToday ? "bg-indigo-100 text-indigo-700 font-bold" :
                        isPast ? "text-gray-300" :
                        i === 0 ? "text-red-400 hover:bg-red-50" :
                        i === 6 ? "text-blue-400 hover:bg-blue-50" :
                        "hover:bg-gray-100"
                      }`}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    {selectedDate.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })} の空き枠
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => { setSelectedTime(s.time); setBookingStep(3); }}
                        className={`py-2 px-3 rounded-lg text-sm border transition-colors ${
                          selectedTime === s.time ? "bg-indigo-600 text-white border-indigo-600" :
                          s.available ? "hover:bg-indigo-50 hover:border-indigo-300 border-gray-200" :
                          "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                        }`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="ghost" onClick={() => setBookingStep(1)}>
                <ChevronLeft size={16} className="mr-1" /> 戻る
              </Button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {bookingStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">予約内容の確認</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-xl divide-y">
                  {[
                    { label: "診療タイプ", value: TYPE_LABELS[selectedType].label },
                    { label: "担当医師", value: `${selectedDoctor?.name} 先生` },
                    {
                      label: "日時",
                      value: `${selectedDate?.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })} ${selectedTime}`,
                    },
                    { label: "診療時間", value: "15分" },
                    { label: "クリニック", value: "Medixusクリニック渋谷" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm px-4 py-3">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>予約確定後のキャンセルは診察24時間前まで可能です。当日キャンセルはキャンセル料が発生する場合があります。</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setBookingStep(2)} className="flex-1">
                    <ChevronLeft size={16} className="mr-1" /> 戻る
                  </Button>
                  <Button onClick={handleBook} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <Check size={16} className="mr-2" /> 予約を確定する
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Booking Success */}
      {booked && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold">予約が確定しました</h2>
            <p className="text-sm text-muted-foreground">
              {selectedDate?.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}{" "}
              {selectedTime} に {selectedDoctor?.name} 先生の{TYPE_LABELS[selectedType].label}を予約しました。
            </p>
            <div className="bg-white rounded-xl border p-3 text-left">
              <p className="text-xs font-medium text-muted-foreground mb-2">診察前の準備をしておきましょう</p>
              {PRE_CHECKLIST.slice(0, 3).map((item, i) => (
                <p key={i} className="text-xs text-gray-600 flex items-start gap-2 mb-1">
                  <span className="text-indigo-400 mt-0.5">✓</span> {item}
                </p>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => { setTab("upcoming"); setBooked(false); loadAppointments(); }}
              >
                予約一覧へ
              </Button>
              <Link href="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700">ダッシュボードへ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
