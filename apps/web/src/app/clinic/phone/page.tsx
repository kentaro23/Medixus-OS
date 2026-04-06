"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Phone, PhoneIncoming, Bot, User, AlertTriangle,
  Clock, RefreshCw, Settings, CheckCircle, Bell,
  CalendarPlus,
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
  duration_seconds?: number;
  started_at: string;
  transferred_to_staff: boolean; // true = 折り返し要
}

const PURPOSE_LABELS: Record<string, { label: string; color: string }> = {
  appointment: { label: "予約",       color: "bg-blue-100 text-blue-700" },
  change:      { label: "変更",       color: "bg-yellow-100 text-yellow-700" },
  cancel:      { label: "キャンセル",  color: "bg-orange-100 text-orange-700" },
  inquiry:     { label: "問合せ",     color: "bg-gray-100 text-gray-700" },
  prescription:{ label: "処方箋",    color: "bg-purple-100 text-purple-700" },
  emergency:   { label: "緊急",       color: "bg-red-100 text-red-700" },
  other:       { label: "その他",     color: "bg-gray-100 text-gray-700" },
};

// デモデータ（Supabase未設定 or ロード前の表示用）
const DEMO_LOGS: CallLog[] = [
  { id: "d1", caller_phone: "090-1234-5678", patient_name: "大原 健太郎", handler: "ai", purpose: "appointment", ai_summary: "【予約】大原健太郎様 / 再診での予約。4月9日木曜日、午前9時。", started_at: new Date(Date.now() - 600000).toISOString(), transferred_to_staff: false },
  { id: "d2", caller_phone: "080-9876-5432", handler: "ai", purpose: "cancel", ai_summary: "【キャンセル】鈴木様 / 4月8日10時のご予約をキャンセルしたい。折り返し確認が必要。", started_at: new Date(Date.now() - 3600000).toISOString(), transferred_to_staff: true },
  { id: "d3", caller_phone: "070-1111-2222", patient_name: "田中 花子", handler: "ai", purpose: "inquiry", ai_summary: "【問い合わせ】田中様 / 薬の副作用について相談したい。スタッフへ折り返し。", started_at: new Date(Date.now() - 7200000).toISOString(), transferred_to_staff: true },
  { id: "d4", caller_phone: "090-3333-4444", handler: "staff", purpose: "emergency", ai_summary: "緊急通報: 胸の痛みを訴える。119番を案内。", started_at: new Date(Date.now() - 86400000).toISOString(), transferred_to_staff: false },
];

export default function PhoneManagementPage() {
  const [tab, setTab] = useState<"logs" | "settings">("logs");
  const [logs, setLogs] = useState<CallLog[]>(DEMO_LOGS);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [filterCallback, setFilterCallback] = useState<boolean>(false);
  const [settings, setSettings] = useState({
    clinicName: "Medixusクリニック",
    aiEnabled: true,
    afterHoursAi: true,
    transferPhone: "03-1234-5678",
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filterPurpose !== "all") params.set("purpose", filterPurpose);
      if (filterCallback) params.set("requires_callback", "true");

      const res = await fetch(`/api/phone/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs?.length > 0) {
          setLogs(data.logs);
        }
        // 未認証 or 空の場合はデモデータのまま
      }
    } catch {
      // デモデータのまま表示
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [filterPurpose, filterCallback]);

  // 初回ロード + 30秒ごとに自動リフレッシュ
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // 折り返し完了マーク
  const markCallbackDone = async (id: string) => {
    try {
      await fetch("/api/phone/logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setLogs((prev) => prev.map((l) => l.id === id ? { ...l, transferred_to_staff: false } : l));
    } catch {
      /* noop */
    }
  };

  const filtered = logs.filter((l) => {
    if (filterPurpose !== "all" && l.purpose !== filterPurpose) return false;
    if (filterCallback && !l.transferred_to_staff) return false;
    return true;
  });

  const callbackCount = logs.filter((l) => l.transferred_to_staff).length;
  const aiCount = logs.filter((l) => l.handler === "ai").length;
  const aiRate = Math.round((aiCount / Math.max(logs.length, 1)) * 100);
  const emergencyCount = logs.filter((l) => l.purpose === "emergency").length;
  const appointmentCount = logs.filter((l) => l.purpose === "appointment").length;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI電話受付</h1>
          <p className="text-sm text-muted-foreground">
            自動応答と通話ログ管理 ·
            最終更新: {lastRefresh.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={loading} variant="outline" size="sm">
          <RefreshCw size={14} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          更新
        </Button>
      </div>

      {/* 折り返し要 アラート */}
      {callbackCount > 0 && (
        <Card className="border-orange-300 bg-orange-50/40">
          <CardContent className="p-3 flex items-center gap-3">
            <Bell size={18} className="text-orange-600 shrink-0" />
            <p className="text-sm font-medium text-orange-800">
              折り返し連絡が必要な通話が <span className="text-lg font-bold">{callbackCount}</span> 件あります
            </p>
            <Button size="sm" variant="outline" className="ml-auto border-orange-400 text-orange-700"
              onClick={() => setFilterCallback(true)}>
              一覧を絞り込む
            </Button>
          </CardContent>
        </Card>
      )}

      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Phone size={20} className="mx-auto mb-1 text-cyan-600" />
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground">総通話数</p>
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
            <CalendarPlus size={20} className="mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold">{appointmentCount}</p>
            <p className="text-xs text-muted-foreground">予約件数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle size={20} className="mx-auto mb-1 text-red-600" />
            <p className="text-2xl font-bold">{emergencyCount}</p>
            <p className="text-xs text-muted-foreground">緊急通報</p>
          </CardContent>
        </Card>
      </div>

      {/* タブ切替 */}
      <div className="flex gap-2">
        <Button variant={tab === "logs" ? "default" : "outline"}
          onClick={() => setTab("logs")}
          className={tab === "logs" ? "bg-cyan-600 hover:bg-cyan-700" : ""}>
          <PhoneIncoming size={16} className="mr-2" /> 通話ログ
        </Button>
        <Button variant={tab === "settings" ? "default" : "outline"}
          onClick={() => setTab("settings")}
          className={tab === "settings" ? "bg-cyan-600 hover:bg-cyan-700" : ""}>
          <Settings size={16} className="mr-2" /> 設定
        </Button>
      </div>

      {/* 通話ログ */}
      {tab === "logs" && (
        <div className="space-y-3">
          {/* フィルター */}
          <div className="flex gap-2 flex-wrap">
            <select value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="all">用件: すべて</option>
              <option value="appointment">予約</option>
              <option value="change">変更</option>
              <option value="cancel">キャンセル</option>
              <option value="inquiry">問合せ</option>
              <option value="prescription">処方箋</option>
              <option value="emergency">緊急</option>
            </select>
            <label className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
              <input type="checkbox" checked={filterCallback}
                onChange={(e) => setFilterCallback(e.target.checked)} />
              折り返し要のみ
            </label>
            {(filterPurpose !== "all" || filterCallback) && (
              <Button size="sm" variant="ghost" onClick={() => { setFilterPurpose("all"); setFilterCallback(false); }}>
                フィルター解除
              </Button>
            )}
          </div>

          {/* テーブル */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">日時</th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">発信者 / 患者名</th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">用件</th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">AI要約</th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">対応</th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">アクション</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      通話ログがありません
                    </td>
                  </tr>
                )}
                {filtered.map((log) => (
                  <tr key={log.id}
                    className={`border-t hover:bg-gray-50 transition-colors ${log.transferred_to_staff ? "bg-orange-50/30" : ""}`}>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">
                      {new Date(log.started_at).toLocaleString("ja-JP", {
                        month: "numeric", day: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500">{log.caller_phone || "非通知"}</p>
                      {log.patient_name && (
                        <p className="text-sm font-medium text-cyan-700">{log.patient_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${PURPOSE_LABELS[log.purpose]?.color || "bg-gray-100 text-gray-700"}`}>
                        {PURPOSE_LABELS[log.purpose]?.label || log.purpose}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                      <p className="line-clamp-2">{log.ai_summary}</p>
                    </td>
                    <td className="px-4 py-3">
                      {log.handler === "ai" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700">
                          <Bot size={12} /> AI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700">
                          <User size={12} /> スタッフ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.transferred_to_staff ? (
                        <Button size="sm" variant="outline"
                          className="text-xs h-7 border-orange-300 text-orange-700 hover:bg-orange-50"
                          onClick={() => markCallbackDone(log.id)}>
                          <CheckCircle size={12} className="mr-1" /> 折り返し済
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            {filtered.length}件表示 · 30秒ごとに自動更新
          </p>
        </div>
      )}

      {/* 設定タブ */}
      {tab === "settings" && (
        <div className="space-y-4 max-w-2xl">
          <Card>
            <CardHeader><CardTitle className="text-base">AI電話受付の接続設定</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                medixus-ai-phoneの <code className="bg-gray-100 px-1 rounded">.env</code> に以下を設定してください：
              </p>
              <div className="bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-xs">
                <p>MEDIXUS_OS_WEBHOOK_URL={typeof window !== "undefined" ? window.location.origin : "https://your-app.vercel.app"}/api/phone/incoming</p>
              </div>
              <p className="text-xs text-muted-foreground">
                通話が完了するたびに自動でこのページに反映されます。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">クリニック設定</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>クリニック名（AI応答に使用）</Label>
                <Input value={settings.clinicName}
                  onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })} />
              </div>
              <div>
                <Label>緊急時転送先電話番号</Label>
                <Input value={settings.transferPhone}
                  onChange={(e) => setSettings({ ...settings, transferPhone: e.target.value })} />
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.aiEnabled}
                  onChange={(e) => setSettings({ ...settings, aiEnabled: e.target.checked })} />
                <span className="text-sm">AI自動応答を有効にする</span>
              </label>
              <Button className="bg-cyan-600 hover:bg-cyan-700">設定を保存</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
