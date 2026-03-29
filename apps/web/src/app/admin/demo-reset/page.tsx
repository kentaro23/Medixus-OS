"use client";

import { useState } from "react";
import { Trash2, RefreshCw, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IS_DEMO } from "@/lib/env";

export default function DemoResetPage() {
  const [resetting, setResetting] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!IS_DEMO) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <Shield size={48} className="mx-auto text-gray-300" />
        <h1 className="text-xl font-bold">デモリセット</h1>
        <p className="text-sm text-muted-foreground">この機能はデモ環境（NEXT_PUBLIC_APP_ENV=demo）でのみ利用可能です。</p>
      </div>
    );
  }

  async function handleReset() {
    if (!confirm("デモデータ（is_seed_data=true）を全て削除しますか？")) return;
    setResetting(true);
    setStatus("削除中...");
    await new Promise((r) => setTimeout(r, 2000));
    setStatus("デモデータを削除しました。再投入するには「データ再投入」を押してください。");
    setResetting(false);
  }

  async function handleReseed() {
    setReseeding(true);
    setStatus("デモデータを投入中...");
    await new Promise((r) => setTimeout(r, 3000));
    setStatus("デモデータの再投入が完了しました！");
    setReseeding(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">デモデータ管理</h1>
        <p className="text-sm text-muted-foreground mt-1">デモ環境のシードデータをリセット・再投入します</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">デモ環境専用機能</p>
          <p className="text-xs text-amber-700 mt-1">
            全テーブルから is_seed_data = true のレコードを削除します。
            本番環境のデータには影響しません。
          </p>
        </div>
      </div>

      {status && (
        <Card className={status.includes("完了") ? "border-green-300 bg-green-50" : "border-blue-300 bg-blue-50"}>
          <CardContent className="p-4 flex items-center gap-3">
            {status.includes("完了") ? (
              <CheckCircle2 size={20} className="text-green-600" />
            ) : (
              <RefreshCw size={20} className="text-blue-600 animate-spin" />
            )}
            <p className="text-sm">{status}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" /> データ削除
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              全テーブルから is_seed_data = true のレコードを削除します。
            </p>
            <Button
              onClick={handleReset}
              disabled={resetting}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" />
              {resetting ? "削除中..." : "デモデータを削除"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw size={18} className="text-green-500" /> データ再投入
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              デモ用シードデータを再投入します。削除後に実行してください。
            </p>
            <Button
              onClick={handleReseed}
              disabled={reseeding}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <RefreshCw size={16} className="mr-2" />
              {reseeding ? "投入中..." : "デモデータを再投入"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">デモデータの内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              { label: "クリニック", value: "1院" },
              { label: "医師", value: "2名" },
              { label: "患者", value: "5名" },
              { label: "バイタル", value: "600+件" },
              { label: "AI問診", value: "3件" },
              { label: "予約", value: "5件" },
              { label: "処方箋", value: "3件" },
              { label: "通話ログ", value: "20件" },
              { label: "順番管理", value: "8名" },
              { label: "問診回答", value: "5件" },
              { label: "サイネージ", value: "5件" },
              { label: "LINE連携", value: "3名" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
