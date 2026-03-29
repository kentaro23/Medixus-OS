"use client";

import { useState } from "react";
import { MessageSquare, QrCode, CheckCircle2, ArrowLeft, Bell, Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function LineConnectionPage() {
  const [connected, setConnected] = useState(false);

  function handleConnect() {
    setConnected(true);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} className="mr-1" /> 設定に戻る</Button>
        </Link>
        <h1 className="text-xl font-bold">LINE連携</h1>
      </div>

      {connected ? (
        <div className="space-y-4">
          <Card className="border-green-300 bg-green-50/50">
            <CardContent className="p-6 text-center space-y-3">
              <CheckCircle2 size={48} className="text-green-600 mx-auto" />
              <h2 className="text-lg font-bold text-green-700">LINE連携済み</h2>
              <p className="text-sm text-muted-foreground">Medixusクリニック渋谷のLINE公式アカウントと連携しています</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">LINEで利用できる機能</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Calendar, label: "予約の確認・変更・キャンセル" },
                { icon: Bell, label: "予約リマインダー通知" },
                { icon: MessageSquare, label: "診察呼出通知" },
                { icon: ClipboardList, label: "Web問診票の入力誘導" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <item.icon size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConnected(false)}>
            LINE連携を解除する
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare size={32} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold">LINEと連携する</h2>
              <p className="text-sm text-muted-foreground">
                LINE公式アカウントを友達追加すると、予約通知や診察呼出をLINEで受け取れます。
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-green-300">
            <CardContent className="p-8 text-center space-y-3">
              <QrCode size={120} className="mx-auto text-green-400" />
              <p className="text-sm text-muted-foreground">このQRコードをLINEアプリで読み取ってください</p>
            </CardContent>
          </Card>

          <Button onClick={handleConnect} className="w-full bg-green-600 hover:bg-green-700 h-12">
            <MessageSquare size={18} className="mr-2" /> LINE友達追加が完了した
          </Button>
        </div>
      )}
    </div>
  );
}
