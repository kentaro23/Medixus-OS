"use client";

import { useState } from "react";
import {
  Video,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  MonitorUp,
  Calendar,
  Clock,
  User,
  FileText,
  Send,
  CreditCard,
  Pill,
  CircleDot,
  X,
  ChevronRight,
  Plus,
  Camera,
  CameraOff,
} from "lucide-react";
import { todayAppointments, patients, prescriptions } from "@/lib/clinic-data";
import type { Appointment, Patient, Prescription } from "@/lib/clinic-data";

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: "bg-gray-100", text: "text-gray-500", label: "完了" },
  "in-progress": { bg: "bg-green-100", text: "text-green-700", label: "診察中" },
  waiting: { bg: "bg-amber-100", text: "text-amber-700", label: "待機中" },
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "予定" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", label: "キャンセル" },
  "no-show": { bg: "bg-red-100", text: "text-red-600", label: "未来院" },
};

function VideoRoom({ appointment, patient, onClose }: { appointment: Appointment; patient: Patient | undefined; onClose: () => void }) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [notes, setNotes] = useState("");
  const [showPrescription, setShowPrescription] = useState(false);
  const [elapsed, setElapsed] = useState("05:32");

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800">
        <div className="flex items-center gap-3">
          <CircleDot size={12} className="text-red-500 animate-pulse-dot" />
          <span className="text-white text-sm font-medium">オンライン診療中</span>
          <span className="text-gray-400 text-sm">{elapsed}</span>
        </div>
        <div className="flex items-center gap-2 text-white text-sm">
          <span>{appointment.patientName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">{appointment.reason}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-cols-2 gap-1 p-1 bg-gray-900">
            <div className="bg-gray-800 rounded-xl flex items-center justify-center relative">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                <User size={48} className="text-gray-500" />
              </div>
              <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {appointment.patientName}
              </span>
            </div>
            <div className="bg-gray-800 rounded-xl flex items-center justify-center relative">
              <div className="w-24 h-24 bg-cyan-900/50 rounded-full flex items-center justify-center">
                <Video size={48} className="text-cyan-400" />
              </div>
              <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {appointment.doctor}（医師）
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-4 bg-gray-800">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                micOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 text-white"
              }`}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={() => setCamOn(!camOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                camOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 text-white"
              }`}
            >
              {camOn ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>
            <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center">
              <MonitorUp size={20} />
            </button>
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
            >
              <PhoneOff size={22} />
            </button>
          </div>
        </div>

        <div className="w-96 bg-white flex flex-col border-l">
          <div className="flex border-b">
            <button
              onClick={() => setShowPrescription(false)}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                !showPrescription ? "border-cyan-500 text-cyan-600" : "border-transparent text-gray-500"
              }`}
            >
              診療メモ
            </button>
            <button
              onClick={() => setShowPrescription(true)}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                showPrescription ? "border-cyan-500 text-cyan-600" : "border-transparent text-gray-500"
              }`}
            >
              処方箋
            </button>
          </div>

          {!showPrescription ? (
            <div className="flex-1 flex flex-col p-4">
              {patient && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
                  <p className="font-semibold">{patient.name}（{patient.age}歳 {patient.gender}）</p>
                  <p className="text-gray-500">疾患: {patient.conditions.join(", ")}</p>
                  <p className="text-gray-500">
                    服薬: {patient.medications.map((m) => m.name).join(", ")}
                  </p>
                  {patient.vitals && (
                    <p className="text-gray-500">
                      BP: {patient.vitals.bp} / HR: {patient.vitals.hr} / SpO2: {patient.vitals.spo2}%
                    </p>
                  )}
                </div>
              )}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="診療メモを入力...&#10;&#10;【S】&#10;【O】&#10;【A】&#10;【P】"
                className="flex-1 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              <button className="mt-3 w-full py-2 bg-cyan-500 text-white text-sm font-medium rounded-xl hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2">
                <FileText size={16} /> カルテに保存
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex-1 space-y-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">処方内容</p>
                  {patient?.medications.map((med, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 text-sm">
                      <Pill size={14} className="text-cyan-500" />
                      <span className="font-medium">{med.name}</span>
                      <span className="text-gray-400">{med.dosage} {med.frequency}</span>
                    </div>
                  ))}
                  <button className="mt-2 flex items-center gap-1 text-xs text-cyan-600 font-medium">
                    <Plus size={12} /> 薬剤を追加
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">送付先薬局</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30">
                    <option>ウエルシア薬局 渋谷店</option>
                    <option>日本調剤 新宿店</option>
                    <option>スギ薬局 六本木店</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <button className="w-full py-2 bg-cyan-500 text-white text-sm font-medium rounded-xl hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2">
                  <Send size={16} /> 処方箋を送信
                </button>
                <button className="w-full py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                  <CreditCard size={16} /> 会計処理
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnlineConsultationPage() {
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [activeVideo, setActiveVideo] = useState<Appointment | null>(null);
  const [tab, setTab] = useState<"today" | "prescription">("today");

  const onlineAppts = todayAppointments.filter((a) => a.type === "online" || a.status === "in-progress");
  const allAppts = todayAppointments;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Video size={28} className="text-cyan-500" /> オンライン診療プラットフォーム
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ビデオ診察・処方箋発行・決済をワンストップで
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">
            {onlineAppts.filter((a) => a.status !== "completed" && a.status !== "cancelled").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">本日のオンライン予約</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {allAppts.filter((a) => a.status === "in-progress").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">現在診察中</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {allAppts.filter((a) => a.status === "waiting").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">待機中の患者</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">
            {prescriptions.filter((p) => p.status === "draft").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">処方箋下書き</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("today")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "today" ? "border-cyan-500 text-cyan-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar size={14} className="inline mr-1.5" />本日のスケジュール
        </button>
        <button
          onClick={() => setTab("prescription")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "prescription" ? "border-cyan-500 text-cyan-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Pill size={14} className="inline mr-1.5" />処方箋管理
        </button>
      </div>

      {tab === "today" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-card-bg border border-card-border rounded-2xl">
            <div className="p-4 border-b border-card-border font-semibold">予約一覧</div>
            <div className="divide-y divide-gray-50">
              {allAppts.map((appt) => {
                const st = statusStyle[appt.status];
                const patient = patients.find((p) => p.id === appt.patientId);
                return (
                  <div
                    key={appt.id}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                      appt.status === "in-progress" ? "bg-green-50" : "hover:bg-gray-50"
                    } ${selectedAppt?.id === appt.id ? "ring-2 ring-cyan-500/30 ring-inset" : ""}`}
                    onClick={() => setSelectedAppt(appt)}
                  >
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold text-gray-700">{appt.time}</p>
                      <p className="text-[10px] text-gray-400">{appt.duration}分</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{appt.patientName}</p>
                        {appt.type === "online" && (
                          <Video size={12} className="text-cyan-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{appt.reason}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${st.bg} ${st.text}`}>
                      {appt.status === "in-progress" && <CircleDot size={10} className="inline mr-1 animate-pulse-dot" />}
                      {st.label}
                    </span>
                    {(appt.type === "online" && (appt.status === "waiting" || appt.status === "in-progress" || appt.status === "scheduled")) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveVideo(appt); }}
                        className="px-3 py-1.5 bg-cyan-500 text-white text-xs font-medium rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-1"
                      >
                        <Video size={12} /> {appt.status === "in-progress" ? "再参加" : "開始"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">
              {selectedAppt ? "予約詳細" : "予約を選択してください"}
            </h3>
            {selectedAppt && (() => {
              const patient = patients.find((p) => p.id === selectedAppt.patientId);
              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                        <User size={18} className="text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{selectedAppt.patientName}</p>
                        <p className="text-xs text-gray-500">
                          {patient?.age}歳 {patient?.gender}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">時間</span>
                        <span className="font-medium">{selectedAppt.time}（{selectedAppt.duration}分）</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">種別</span>
                        <span className="font-medium">{selectedAppt.type === "online" ? "オンライン" : "対面"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">受診理由</span>
                        <span className="font-medium">{selectedAppt.reason}</span>
                      </div>
                    </div>
                  </div>
                  {patient && (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">基礎疾患</p>
                        <div className="flex flex-wrap gap-1">
                          {patient.conditions.map((c) => (
                            <span key={c} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">現在の処方</p>
                        {patient.medications.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm py-1">
                            <Pill size={12} className="text-gray-400" />
                            <span>{m.name} {m.dosage}</span>
                          </div>
                        ))}
                      </div>
                      {patient.vitals && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">直近バイタル</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-400">血圧</p>
                              <p className="font-semibold">{patient.vitals.bp}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-400">心拍</p>
                              <p className="font-semibold">{patient.vitals.hr} bpm</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="bg-card-bg border border-card-border rounded-2xl">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <h3 className="font-semibold">処方箋一覧</h3>
            <button className="flex items-center gap-1.5 text-sm text-cyan-600 font-medium">
              <Plus size={14} /> 新規作成
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rx.status === "sent" ? "bg-green-100" : rx.status === "dispensed" ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  <Pill size={18} className={
                    rx.status === "sent" ? "text-green-600" : rx.status === "dispensed" ? "text-blue-600" : "text-gray-500"
                  } />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{rx.patientName}</p>
                  <p className="text-xs text-gray-500">
                    {rx.medications.map((m) => m.name).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    rx.status === "sent" ? "bg-green-100 text-green-700" :
                    rx.status === "dispensed" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {rx.status === "sent" ? "送信済" : rx.status === "dispensed" ? "調剤済" : "下書き"}
                  </span>
                  {rx.pharmacy && <p className="text-[10px] text-gray-400 mt-1">{rx.pharmacy}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeVideo && (
        <VideoRoom
          appointment={activeVideo}
          patient={patients.find((p) => p.id === activeVideo.patientId)}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
