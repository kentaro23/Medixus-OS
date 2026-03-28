"use client";

import { useState } from "react";
import {
  Activity,
  Heart,
  Droplets,
  Weight,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Bell,
  BellOff,
  User,
  ChevronRight,
  X,
  Clock,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  patients,
  vitalAlerts,
  vitalHistory,
  vitalTypeLabel,
} from "@/lib/clinic-data";
import type { Patient, VitalAlert } from "@/lib/clinic-data";

const vitalIcon: Record<string, React.ReactNode> = {
  blood_pressure: <Heart size={16} />,
  heart_rate: <Activity size={16} />,
  glucose: <Droplets size={16} />,
  weight: <Weight size={16} />,
  spo2: <Wind size={16} />,
};

function PatientMonitorDetail({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const patientAlerts = vitalAlerts.filter((a) => a.patientId === patient.id);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{patient.name}（{patient.age}歳・{patient.gender}）</h2>
            <p className="text-sm text-gray-500">{patient.conditions.join(" · ")}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {patient.vitals && (
              <>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <Heart size={16} className="mx-auto text-red-500 mb-1" />
                  <p className="text-lg font-bold text-red-700">{patient.vitals.bp}</p>
                  <p className="text-[10px] text-gray-500">血圧 (mmHg)</p>
                </div>
                <div className="bg-pink-50 rounded-xl p-3 text-center">
                  <Activity size={16} className="mx-auto text-pink-500 mb-1" />
                  <p className="text-lg font-bold text-pink-700">{patient.vitals.hr}</p>
                  <p className="text-[10px] text-gray-500">心拍数 (bpm)</p>
                </div>
                {patient.vitals.glucose && (
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <Droplets size={16} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-lg font-bold text-blue-700">{patient.vitals.glucose}</p>
                    <p className="text-[10px] text-gray-500">血糖 (mg/dL)</p>
                  </div>
                )}
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <Weight size={16} className="mx-auto text-amber-500 mb-1" />
                  <p className="text-lg font-bold text-amber-700">{patient.vitals.weight}</p>
                  <p className="text-[10px] text-gray-500">体重 (kg)</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <Wind size={16} className="mx-auto text-green-500 mb-1" />
                  <p className="text-lg font-bold text-green-700">{patient.vitals.spo2}%</p>
                  <p className="text-[10px] text-gray-500">SpO2</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card-bg border border-card-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">血圧推移（7日間）</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vitalHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 200]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "上限", fontSize: 10, fill: "#ef4444" }} />
                  <Line type="monotone" dataKey="bp_sys" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="収縮期" />
                  <Line type="monotone" dataKey="bp_dia" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="拡張期" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card-bg border border-card-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">血糖値推移（7日間）</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vitalHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[100, 280]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "上限", fontSize: 10, fill: "#ef4444" }} />
                  <Line type="monotone" dataKey="glucose" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="血糖値" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {patientAlerts.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" /> アラート履歴
              </h3>
              <div className="space-y-2">
                {patientAlerts.map((alert) => (
                  <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                    alert.severity === "critical" ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"
                  }`}>
                    {vitalIcon[alert.type]}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{vitalTypeLabel[alert.type]}: {alert.value}</p>
                      <p className="text-xs text-gray-500">基準値: {alert.threshold}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {alert.acknowledged ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={16} className="text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-sm mb-3">接続デバイス</h3>
            <div className="flex flex-wrap gap-2">
              {patient.monitoringDevices.length > 0 ? patient.monitoringDevices.map((d) => (
                <span key={d} className="flex items-center gap-1.5 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
                  <Wifi size={12} /> {d}
                </span>
              )) : (
                <span className="text-sm text-gray-400 flex items-center gap-1.5">
                  <WifiOff size={12} /> デバイス未接続
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RemoteMonitoringPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [alertFilter, setAlertFilter] = useState<"all" | "unresolved">("unresolved");

  const monitoredPatients = patients.filter((p) => p.monitoringDevices.length > 0);
  const unresolvedAlerts = vitalAlerts.filter((a) => !a.acknowledged);
  const filteredAlerts = alertFilter === "unresolved" ? unresolvedAlerts : vitalAlerts;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Activity size={28} className="text-emerald-500" /> 遠隔モニタリング
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          患者のバイタルデータをリアルタイム監視。AI異常検知でアラート通知。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{monitoredPatients.length}</p>
          <p className="text-xs text-gray-500 mt-1">モニタリング中</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{unresolvedAlerts.length}</p>
          <p className="text-xs text-gray-500 mt-1">未対応アラート</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">{monitoredPatients.reduce((s, p) => s + p.monitoringDevices.length, 0)}</p>
          <p className="text-xs text-gray-500 mt-1">接続デバイス</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">1,240</p>
          <p className="text-xs text-gray-500 mt-1">今日のデータ件数</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card-bg border border-card-border rounded-2xl">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> アラート
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setAlertFilter("unresolved")}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  alertFilter === "unresolved" ? "bg-red-100 text-red-700" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                未対応 ({unresolvedAlerts.length})
              </button>
              <button
                onClick={() => setAlertFilter("all")}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  alertFilter === "all" ? "bg-gray-200 text-gray-700" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                全て
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-center gap-3 p-4 transition-colors ${
                !alert.acknowledged ? "bg-red-50/30" : "hover:bg-gray-50"
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alert.severity === "critical" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-500"
                }`}>
                  {vitalIcon[alert.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{alert.patientName}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      alert.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {vitalTypeLabel[alert.type]}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5">
                    <span className="font-semibold">{alert.value}</span>
                    <span className="text-gray-400 ml-1">（基準: {alert.threshold}）</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {!alert.acknowledged ? (
                    <button className="text-xs text-red-600 font-medium hover:text-red-800">
                      対応する
                    </button>
                  ) : (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={10} /> 対応済
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl">
          <div className="p-4 border-b border-card-border">
            <h2 className="font-semibold flex items-center gap-2">
              <User size={16} className="text-gray-500" /> モニタリング中の患者
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {monitoredPatients.map((patient) => {
              const alerts = vitalAlerts.filter(
                (a) => a.patientId === patient.id && !a.acknowledged
              );
              return (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    patient.riskLevel === "high" ? "bg-red-500" :
                    patient.riskLevel === "medium" ? "bg-amber-500" : "bg-green-500"
                  }`}>
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{patient.name}</p>
                      <span className="text-xs text-gray-400">{patient.age}歳</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {patient.vitals && (
                        <>
                          <span className="text-xs text-gray-500">BP: {patient.vitals.bp}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-500">HR: {patient.vitals.hr}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {patient.monitoringDevices.map((d) => (
                        <span key={d} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{d}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {alerts.length > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                        {alerts.length}件
                      </span>
                    )}
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedPatient && (
        <PatientMonitorDetail
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
