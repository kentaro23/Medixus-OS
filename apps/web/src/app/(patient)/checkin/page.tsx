"use client";

import { useState } from "react";
import { QrCode, CheckCircle2, ClipboardList, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckinPage() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);

  function handleCheckin() {
    setQueueNumber(Math.floor(Math.random() * 10) + 40);
    setEstimatedWait(Math.floor(Math.random() * 20) + 5);
    setCheckedIn(true);
  }

  if (checkedIn && queueNumber) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">チェックイン完了</h1>

        <Card className="border-indigo-300 bg-indigo-50/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">あなたの番号</p>
            <p className="text-6xl font-bold text-indigo-700 my-3">{queueNumber}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock size={14} />
              <span>予想待ち時間: 約{estimatedWait}分</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Link href="/questionnaire/internal_medicine_v1">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <ClipboardList size={16} className="mr-2" /> 問診票を入力する
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            順番が近づくとLINEまたはプッシュ通知でお知らせします。
            外出される方は「外出モード」をONにしてください。
          </p>
          <Button variant="outline" className="w-full">
            外出モードをON（あと3人で通知）
          </Button>
        </div>

        <Link href="/dashboard">
          <Button variant="ghost" className="text-sm">ダッシュボードへ戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">来院チェックイン</h1>
        <p className="text-sm text-muted-foreground mt-1">受付のQRコードを読み取るか、下のボタンでチェックインしてください</p>
      </div>

      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center space-y-4">
          <QrCode size={80} className="mx-auto text-gray-300" />
          <p className="text-sm text-muted-foreground">受付に設置されたQRコードをスマートフォンのカメラで読み取ってください</p>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center"><span className="bg-gray-50 px-2 text-sm text-muted-foreground">または</span></div>
      </div>

      <Button onClick={handleCheckin} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg">
        <MapPin size={20} className="mr-2" /> 到着しました（チェックイン）
      </Button>

      <p className="text-xs text-muted-foreground">
        LINEをご利用の方は、LINE公式アカウントの「到着報告」ボタンからもチェックインできます。
      </p>
    </div>
  );
}
