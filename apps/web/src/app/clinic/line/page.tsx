"use client";

import { useState } from "react";
import { MessageSquare, QrCode, Bell, Users, Settings, CheckCircle2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LineSettingsPage() {
  const [tab, setTab] = useState<"status" | "settings" | "messages">("status");
  const [connected] = useState(true);
  const [connectedPatients] = useState(42);
  const [settings, setSettings] = useState({
    channelId: "17xxxxx",
    channelSecret: "••••••••",
    accessToken: "••••••••",
    confirmMessage: "ご予約を承りました。\n\n日時: {date} {time}\n担当医: {doctor}\n\n変更・キャンセルはメニューからお願いします。",
    reminder24h: "{patient}様、明日 {time} に {doctor}先生の診察予約があります。",
    reminder1h: "{patient}様、1時間後に診察予約があります。お忘れなくお越しください。",
    callMessage: "{patient}様、診察室にお入りください。",
    awayNotify: "{patient}様、あと{remaining}人です。約{minutes}分後にお呼びします。お戻りください。",
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LINE連携設定</h1>
        <p className="text-sm text-muted-foreground">LINE公式アカウントとの連携・メッセージ設定</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare size={20} className="mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold">{connectedPatients}</p>
            <p className="text-xs text-muted-foreground">LINE連携済み患者</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bell size={20} className="mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-xs text-muted-foreground">今月の通知送信数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Badge className={connected ? "bg-green-500" : "bg-red-500"}>
              {connected ? "接続済み" : "未接続"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">LINE接続状態</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "status" ? "default" : "outline"} onClick={() => setTab("status")} className={tab === "status" ? "bg-green-600" : ""}>
          <Users size={16} className="mr-2" /> 接続状況
        </Button>
        <Button variant={tab === "messages" ? "default" : "outline"} onClick={() => setTab("messages")} className={tab === "messages" ? "bg-green-600" : ""}>
          <MessageSquare size={16} className="mr-2" /> メッセージ設定
        </Button>
        <Button variant={tab === "settings" ? "default" : "outline"} onClick={() => setTab("settings")} className={tab === "settings" ? "bg-green-600" : ""}>
          <Settings size={16} className="mr-2" /> API設定
        </Button>
      </div>

      {tab === "status" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">友達追加QRコード</CardTitle></CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                <QrCode size={80} className="text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">このQRコードを受付に掲示してください</p>
              <Button variant="outline" size="sm"><Copy size={14} className="mr-1" /> URLをコピー</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">リッチメニュー</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 max-w-sm">
                {["予約する", "予約変更", "到着報告"].map((label) => (
                  <div key={label} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-xs font-medium text-green-700">{label}</div>
                ))}
                {["問診票入力", "呼出状況", "クリニック情報"].map((label) => (
                  <div key={label} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-xs font-medium text-green-700">{label}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "messages" && (
        <div className="space-y-4 max-w-2xl">
          {[
            { key: "confirmMessage" as const, label: "予約確認メッセージ", vars: "{date}, {time}, {doctor}" },
            { key: "reminder24h" as const, label: "24時間前リマインダー", vars: "{patient}, {time}, {doctor}" },
            { key: "reminder1h" as const, label: "1時間前リマインダー", vars: "{patient}" },
            { key: "callMessage" as const, label: "呼出メッセージ", vars: "{patient}" },
            { key: "awayNotify" as const, label: "外出患者への通知", vars: "{patient}, {remaining}, {minutes}" },
          ].map((item) => (
            <Card key={item.key}>
              <CardContent className="p-4 space-y-2">
                <Label>{item.label}</Label>
                <textarea
                  value={settings[item.key]}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
                  className="w-full border rounded-lg p-3 text-sm h-20"
                />
                <p className="text-xs text-muted-foreground">変数: {item.vars}</p>
              </CardContent>
            </Card>
          ))}
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            {saved ? <><CheckCircle2 size={16} className="mr-2" />保存しました</> : "メッセージ設定を保存"}
          </Button>
        </div>
      )}

      {tab === "settings" && (
        <Card className="max-w-2xl">
          <CardHeader><CardTitle className="text-base">LINE Messaging API 設定</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Channel ID</Label><Input value={settings.channelId} onChange={(e) => setSettings({ ...settings, channelId: e.target.value })} /></div>
            <div><Label>Channel Secret</Label><Input type="password" value={settings.channelSecret} onChange={(e) => setSettings({ ...settings, channelSecret: e.target.value })} /></div>
            <div><Label>Channel Access Token</Label><Input type="password" value={settings.accessToken} onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })} /></div>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              {saved ? "保存しました" : "API設定を保存"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
