"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOff,
  Bot,
  User,
  AlertTriangle,
  Clock,
  TrendingUp,
  Play,
  Settings,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CallLog {
  id: string;
  caller_phone: string;
  patient_name?: string;
  handler: "ai" | "staff" | "voicemail";
  purpose: string;
  ai_summary: string;
  duration_seconds: number;
  started_at: string;
  transferred: boolean;
}

const PURPOSE_LABELS: Record<string, { label: string; color: string }> = {
  appointment: { label: "予約", color: "bg-blue-100 text-blue-700" },
  change: { label: "変更", color: "bg-yellow-100 text-yellow-700" },
  cancel: { label: "キャンセル", color: "bg-orange-100 text-orange-700" },
  inquiry: { label: "問合せ", color: "bg-gray-100 text-gray-700" },
  emergency: { label: "緊急", color: "bg-red-100 text-red-700" },
  other: { label: "その他", color: "bg-gray-100 text-gray-700" },
};

const DEMO_LOGS: CallLog[] = Array.from({ length: 20 }, (_, i) => {
  const purposes = ["appointment", "appointment", "appointment", "change", "cancel", "inquiry", "inquiry", "emergency"];
  const purpose = purposes[i % purposes.length];
  const handler = i % 4 === 3 ? "staff" as const : "ai" as const;
  return {
    id: `call-${i}`,
    caller_phone: `090-${String(1000 + i).padStart(4, "0")}-${String(5000 + i * 111).slice(0, 4)}`,
    patient_name: i % 3 === 0 ? ["山田 太郎", "田中 花子", "鈴木 次郎", "高橋 美咲"][i % 4] : undefined,
    handler,
    purpose,
    ai_summary: purpose === "appointment" ? "新規予約の問い合わせ" : purpose === "change" ? "予約変更の依頼" : purpose === "emergency" ? "緊急性のある症状の報告" : "一般的な問い合わせ",
    duration_seconds: 30 + Math.floor(Math.random() * 180),
    started_at: new Date(Date.now() - i * 1800000).toISOString(),
    transferred: handler === "staff",
  };
});

export default function PhoneManagementPage() {
  const [tab, setTab] = useState<"logs" | "settings">("logs");
  const [logs, setLogs] = useState(DEMO_LOGS);
  const [filterHandler, setFilterHandler] = useState<string>("all");
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);
  const [settings, setSettings] = useState({
    clinicName: "Medixusクリニック渋谷",
    businessHours: "09:00-18:00",
    aiEnabled: true,
    afterHoursAi: true,
    transferPhone: "03-1234-5678",
    afterHoursMessage: "診療時間外です。緊急の場合は119番に電話してください。診療時間は平日9:00-18:00です。",
  });

  const filtered = logs.filter((l) => {
    if (filterHandler !== "all" && l.handler !== filterHandler) return false;
    if (filterPurpose !== "all" && l.purpose !== filterPurpose) return false;
    return true;
  });

  const aiCount = logs.filter((l) => l.handler === "ai").length;
  const aiRate = Math.round((aiCount / Math.max(logs.length, 1)) * 100);
  const avgDuration = Math.round(logs.reduce((s, l) => s + l.duration_seconds, 0) / Math.max(logs.length, 1));

  async function simulateCall() {
    setSimulating(true);
    try {
      const res = await fetch("/api/phone/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setSimResult(data);
    } catch {
      setSimResult({ error: "シミュレーションに失敗しました" });
    }
    setSimulating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI電話受付</h1>
          <p className="text-sm text-muted-foreground">着信の自動応答と通話ログ管理</p>
        </div>
        <Button onClick={simulateCall} disabled={simulating} variant="outline">
          <Play size={16} className="mr-2" /> {simulating ? "テスト中..." : "テスト着信"}
        </Button>
      </div>

      {simResult && (
        <Card className="border-cyan-300 bg-cyan-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">シミュレーション結果</h3>
              <Button size="sm" variant="ghost" onClick={() => setSimResult(null)}>閉じる</Button>
            </div>
            <pre className="text-xs bg-white rounded-lg p-3 overflow-auto max-h-40">
              {JSON.stringify(simResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Phone size={20} className="mx-auto mb-1 text-cyan-600" />
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground">今月の通話数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bot size={20} className="mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold">{aiRate}%</p>
            <p className="text-xs text-muted-foreground">AI対応率</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock size={20} className="mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold">{Math.floor(avgDuration / 60)}:{String(avgDuration % 60).padStart(2, "0")}</p>
            <p className="text-xs text-muted-foreground">平均通話時間</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle size={20} className="mx-auto mb-1 text-red-600" />
            <p className="text-2xl font-bold">{logs.filter((l) => l.purpose === "emergency").length}</p>
            <p className="text-xs text-muted-foreground">緊急通報</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "logs" ? "default" : "outline"} onClick={() => setTab("logs")} className={tab === "logs" ? "bg-cyan-600" : ""}>
          <PhoneIncoming size={16} className="mr-2" /> 通話ログ
        </Button>
        <Button variant={tab === "settings" ? "default" : "outline"} onClick={() => setTab("settings")} className={tab === "settings" ? "bg-cyan-600" : ""}>
          <Settings size={16} className="mr-2" /> 設定
        </Button>
      </div>

      {tab === "logs" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <select value={filterHandler} onChange={(e) => setFilterHandler(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="all">対応者: すべて</option>
              <option value="ai">AI対応</option>
              <option value="staff">スタッフ対応</option>
            </select>
            <select value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="all">用件: すべて</option>
              <option value="appointment">予約</option>
              <option value="change">変更</option>
              <option value="cancel">キャンセル</option>
              <option value="inquiry">問合せ</option>
              <option value="emergency">緊急</option>
            </select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">日時</th>
                  <th className="text-left px-4 py-2 font-medium">発信者</th>
                  <th className="text-left px-4 py-2 font-medium">対応</th>
                  <th className="text-left px-4 py-2 font-medium">用件</th>
                  <th className="text-left px-4 py-2 font-medium">AI要約</th>
                  <th className="text-left px-4 py-2 font-medium">時間</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs whitespace-nowrap">
                      {new Date(log.started_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-xs">{log.caller_phone}</p>
                      {log.patient_name && <p className="text-xs text-cyan-600">{log.patient_name}</p>}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className={`text-xs ${log.handler === "ai" ? "text-green-700 border-green-300" : "text-blue-700 border-blue-300"}`}>
                        {log.handler === "ai" ? <><Bot size={10} className="mr-1" />AI</> : <><User size={10} className="mr-1" />スタッフ</>}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Badge className={PURPOSE_LABELS[log.purpose]?.color || ""}>{PURPOSE_LABELS[log.purpose]?.label || log.purpose}</Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600 max-w-[200px] truncate">{log.ai_summary}</td>
                    <td className="px-4 py-2 text-xs">{Math.floor(log.duration_seconds / 60)}:{String(log.duration_seconds % 60).padStart(2, "0")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-4 max-w-2xl">
          <Card>
            <CardHeader><CardTitle className="text-base">基本設定</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>クリニック名（AI応答に使用）</Label>
                <Input value={settings.clinicName} onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })} />
              </div>
              <div>
                <Label>営業時間</Label>
                <Input value={settings.businessHours} onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })} />
              </div>
              <div>
                <Label>緊急時転送先電話番号</Label>
                <Input value={settings.transferPhone} onChange={(e) => setSettings({ ...settings, transferPhone: e.target.value })} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">AI応答設定</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.aiEnabled} onChange={(e) => setSettings({ ...settings, aiEnabled: e.target.checked })} className="rounded" />
                <span className="text-sm">営業時間内のAI自動応答を有効にする</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.afterHoursAi} onChange={(e) => setSettings({ ...settings, afterHoursAi: e.target.checked })} className="rounded" />
                <span className="text-sm">営業時間外のAI自動応答を有効にする</span>
              </label>
              <div>
                <Label>営業時間外メッセージ</Label>
                <textarea value={settings.afterHoursMessage} onChange={(e) => setSettings({ ...settings, afterHoursMessage: e.target.value })} className="w-full border rounded-lg p-3 text-sm h-20" />
              </div>
              <Button className="bg-cyan-600 hover:bg-cyan-700">設定を保存</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
