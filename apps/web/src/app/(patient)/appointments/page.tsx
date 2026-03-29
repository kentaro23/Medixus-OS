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
  avatar?: string;
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

const TYPE_LABELS: Record<AppointmentType, { label: string; icon: typeof Video }> = {
  online_initial: { label: "オンライン初診", icon: Video },
  online_followup: { label: "オンライン再診", icon: Video },
  in_person_initial: { label: "対面初診", icon: MapPin },
  in_person_followup: { label: "対面再診", icon: MapPin },
  pre_consultation: { label: "診療前相談", icon: Stethoscope },
  self_pay: { label: "自費診療", icon: Stethoscope },
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  scheduled: { label: "予約済", variant: "default" },
  waiting: { label: "待機中", variant: "secondary" },
  in_progress: { label: "診察中", variant: "default" },
  completed: { label: "完了", variant: "outline" },
  cancelled: { label: "キャンセル", variant: "destructive" },
  no_show: { label: "不在", variant: "destructive" },
};

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
    for (const m of [0, 15, 30, 45]) {
      if (h === 12 && m >= 0 && h < 13) continue;
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

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "book">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(DEMO_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType>("online_followup");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookingStep, setBookingStep] = useState(0);
  const [booked, setBooked] = useState(false);

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
    } catch {
      /* demo mode */
    }

    setBooked(true);
  }

  const upcomingAppts = appointments.filter(
    (a) => a.status === "scheduled" && new Date(a.scheduled_at) > new Date()
  );
  const pastAppts = appointments.filter(
    (a) => a.status !== "scheduled" || new Date(a.scheduled_at) <= new Date()
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">予約管理</h1>
        <p className="text-sm text-muted-foreground mt-1">オンライン診療・対面診療の予約を管理します</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "upcoming" ? "default" : "outline"}
          onClick={() => setTab("upcoming")}
          className={tab === "upcoming" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
        >
          <Calendar size={16} className="mr-2" /> 予約一覧
        </Button>
        <Button
          variant={tab === "book" ? "default" : "outline"}
          onClick={() => {
            setTab("book");
            setBookingStep(0);
            setBooked(false);
          }}
          className={tab === "book" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
        >
          <Clock size={16} className="mr-2" /> 新しい予約
        </Button>
      </div>

      {tab === "upcoming" && (
        <div className="space-y-4">
          {upcomingAppts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">今後の予約</h2>
              <div className="space-y-3">
                {upcomingAppts.map((a) => {
                  const typeInfo = TYPE_LABELS[a.appointment_type] || TYPE_LABELS.online_followup;
                  const isUpcoming = new Date(a.scheduled_at).getTime() - Date.now() < 3600000 * 24;
                  return (
                    <Card key={a.id} className={isUpcoming ? "border-indigo-300 bg-indigo-50/30" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <typeInfo.icon size={16} className="text-indigo-600" />
                              <span className="font-medium">{typeInfo.label}</span>
                              <Badge variant={STATUS_LABELS[a.status]?.variant || "outline"}>
                                {STATUS_LABELS[a.status]?.label || a.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {a.doctor_name} | {a.clinic_name || "Medixusクリニック"}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(a.scheduled_at).toLocaleString("ja-JP", {
                                month: "long",
                                day: "numeric",
                                weekday: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              （{a.duration_minutes}分）
                            </p>
                          </div>
                          {a.appointment_type.startsWith("online") && (
                            <Link href={`/appointments/${a.id}/video`}>
                              <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Video size={16} className="mr-2" /> 入室
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {pastAppts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">過去の予約</h2>
              <div className="space-y-2">
                {pastAppts.map((a) => {
                  const typeInfo = TYPE_LABELS[a.appointment_type] || TYPE_LABELS.online_followup;
                  return (
                    <Card key={a.id} className="opacity-75">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <typeInfo.icon size={14} className="text-gray-400" />
                            <div>
                              <span className="text-sm font-medium">{typeInfo.label}</span>
                              <span className="text-sm text-gray-500 ml-2">{a.doctor_name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={STATUS_LABELS[a.status]?.variant || "outline"}>
                              {STATUS_LABELS[a.status]?.label || a.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
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
            <div className="text-center py-12 text-muted-foreground">
              <Calendar size={40} className="mx-auto mb-3 opacity-50" />
              <p>予約はありません</p>
              <Button className="mt-4 bg-indigo-600" onClick={() => setTab("book")}>
                新しい予約を取る
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === "book" && !booked && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            {[
              { step: 0, label: "診療タイプ" },
              { step: 1, label: "医師選択" },
              { step: 2, label: "日時選択" },
              { step: 3, label: "確認" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    bookingStep >= s.step
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {bookingStep > s.step ? <Check size={14} /> : s.step + 1}
                </div>
                <span className={`text-sm ${bookingStep >= s.step ? "font-medium" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < 3 && <ChevronRight size={14} className="text-gray-300" />}
              </div>
            ))}
          </div>

          {bookingStep === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.entries(TYPE_LABELS) as [AppointmentType, { label: string; icon: typeof Video }][]).map(
                ([type, info]) => (
                  <Card
                    key={type}
                    className={`cursor-pointer transition-all ${
                      selectedType === type ? "ring-2 ring-indigo-500 bg-indigo-50" : "hover:shadow-sm"
                    }`}
                    onClick={() => {
                      setSelectedType(type);
                      setBookingStep(1);
                    }}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <info.icon size={24} className="mx-auto text-indigo-600" />
                      <p className="text-sm font-medium">{info.label}</p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}

          {bookingStep === 1 && (
            <div className="space-y-3">
              {doctors.map((d) => (
                <Card
                  key={d.id}
                  className={`cursor-pointer transition-all ${
                    selectedDoctor?.id === d.id ? "ring-2 ring-indigo-500 bg-indigo-50" : "hover:shadow-sm"
                  }`}
                  onClick={() => {
                    setSelectedDoctor(d);
                    setBookingStep(2);
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium">{d.name} 先生</p>
                      <p className="text-sm text-muted-foreground">{d.specialties.join("・")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="ghost" onClick={() => setBookingStep(0)}>
                <ChevronLeft size={16} className="mr-1" /> 戻る
              </Button>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
                  <ChevronLeft size={16} /> 前週
                </Button>
                <span className="font-medium">
                  {weekDays[0].toLocaleDateString("ja-JP", { month: "long" })}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
                  翌週 <ChevronRight size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
                {weekDays.map((d) => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  const isPast = d < new Date() && !isToday;
                  const isSelected = selectedDate?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={d.toISOString()}
                      disabled={isPast}
                      onClick={() => selectDate(d)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : isToday
                            ? "bg-indigo-100 text-indigo-700"
                            : isPast
                              ? "text-gray-300"
                              : "hover:bg-gray-100"
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
                        onClick={() => {
                          setSelectedTime(s.time);
                          setBookingStep(3);
                        }}
                        className={`py-2 px-3 rounded-lg text-sm border transition-colors ${
                          selectedTime === s.time
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : s.available
                              ? "hover:bg-indigo-50 hover:border-indigo-300"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
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

          {bookingStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">予約内容の確認</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">診療タイプ</span>
                    <span className="font-medium">{TYPE_LABELS[selectedType].label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">担当医師</span>
                    <span className="font-medium">{selectedDoctor?.name} 先生</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">日時</span>
                    <span className="font-medium">
                      {selectedDate?.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}{" "}
                      {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">診療時間</span>
                    <span className="font-medium">15分</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>予約確定後、キャンセルは24時間前まで可能です。</p>
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
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setTab("upcoming");
                  setBooked(false);
                  loadAppointments();
                }}
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
