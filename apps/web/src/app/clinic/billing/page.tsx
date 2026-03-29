"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Download,
  Send,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface BillingItem {
  id: string;
  patient_name: string;
  amount: number;
  type: "insurance_copay" | "self_pay";
  method?: "cash" | "card" | "qr";
  status: "pending" | "paid" | "receipted";
  time: string;
  appointment_type?: string;
}

const DEMO_ITEMS: BillingItem[] = [
  { id: "b1", patient_name: "山田 太郎", amount: 3200, type: "insurance_copay", method: "card", status: "receipted", time: "09:15", appointment_type: "再診" },
  { id: "b2", patient_name: "田中 花子", amount: 1500, type: "insurance_copay", method: "cash", status: "receipted", time: "09:45", appointment_type: "再診" },
  { id: "b3", patient_name: "鈴木 次郎", amount: 12000, type: "self_pay", method: "card", status: "paid", time: "10:30", appointment_type: "自費" },
  { id: "b4", patient_name: "高橋 美咲", amount: 2800, type: "insurance_copay", status: "pending", time: "11:00", appointment_type: "初診" },
  { id: "b5", patient_name: "渡辺 健一", amount: 4500, type: "insurance_copay", status: "pending", time: "11:30", appointment_type: "再診" },
  { id: "b6", patient_name: "伊藤 雅子", amount: 8500, type: "self_pay", method: "qr", status: "paid", time: "14:00", appointment_type: "自費" },
];

const METHOD_LABELS: Record<string, { label: string; icon: typeof CreditCard; color: string }> = {
  cash: { label: "現金", icon: Banknote, color: "text-green-700 bg-green-100" },
  card: { label: "クレカ", icon: CreditCard, color: "text-blue-700 bg-blue-100" },
  qr: { label: "QR決済", icon: QrCode, color: "text-purple-700 bg-purple-100" },
};

export default function BillingPage() {
  const [items, setItems] = useState(DEMO_ITEMS);
  const [tab, setTab] = useState<"today" | "report">("today");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const total = items.filter((i) => i.status !== "pending").reduce((s, i) => s + i.amount, 0);
  const pending = items.filter((i) => i.status === "pending");
  const cashTotal = items.filter((i) => i.method === "cash" && i.status !== "pending").reduce((s, i) => s + i.amount, 0);
  const cardTotal = items.filter((i) => i.method === "card" && i.status !== "pending").reduce((s, i) => s + i.amount, 0);
  const qrTotal = items.filter((i) => i.method === "qr" && i.status !== "pending").reduce((s, i) => s + i.amount, 0);

  async function processPayment(id: string, method: "cash" | "card" | "qr") {
    setProcessingId(id);
    await new Promise((r) => setTimeout(r, 1000));
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, status: "paid" as const, method } : item
    ));
    setProcessingId(null);
  }

  function issueReceipt(id: string) {
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, status: "receipted" as const } : item
    ));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">会計管理</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button variant="outline"><Download size={16} className="mr-2" /> レジ締めレポート</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-cyan-300 bg-cyan-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-700">&yen;{total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">本日の売上</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Banknote size={16} className="mx-auto mb-1 text-green-600" />
            <p className="text-lg font-bold">&yen;{cashTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">現金</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard size={16} className="mx-auto mb-1 text-blue-600" />
            <p className="text-lg font-bold">&yen;{cardTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">クレカ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <QrCode size={16} className="mx-auto mb-1 text-purple-600" />
            <p className="text-lg font-bold">&yen;{qrTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">QR決済</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle size={16} className="mx-auto mb-1 text-orange-600" />
            <p className="text-lg font-bold">{pending.length}</p>
            <p className="text-xs text-muted-foreground">未収金</p>
          </CardContent>
        </Card>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">未精算 ({pending.length}件)</h2>
          <div className="space-y-2">
            {pending.map((item) => (
              <Card key={item.id} className="border-orange-200 bg-orange-50/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.patient_name}</span>
                      <Badge variant="outline" className="text-xs">{item.appointment_type}</Badge>
                      <Badge className="bg-orange-100 text-orange-700 text-xs">未精算</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.time} | {item.type === "insurance_copay" ? "保険一部負担金" : "自費"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">&yen;{item.amount.toLocaleString()}</span>
                    <div className="flex gap-1">
                      {(["cash", "card", "qr"] as const).map((method) => {
                        const cfg = METHOD_LABELS[method];
                        return (
                          <Button
                            key={method}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={processingId === item.id}
                            onClick={() => processPayment(item.id, method)}
                          >
                            <cfg.icon size={12} className="mr-1" />
                            {processingId === item.id ? "処理中..." : cfg.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">精算済み</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">時刻</th>
                <th className="text-left px-4 py-2 font-medium">患者名</th>
                <th className="text-left px-4 py-2 font-medium">区分</th>
                <th className="text-right px-4 py-2 font-medium">金額</th>
                <th className="text-left px-4 py-2 font-medium">支払方法</th>
                <th className="text-left px-4 py-2 font-medium">状態</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.filter((i) => i.status !== "pending").map((item) => {
                const methodCfg = item.method ? METHOD_LABELS[item.method] : null;
                return (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{item.time}</td>
                    <td className="px-4 py-2 font-medium">{item.patient_name}</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-xs">{item.type === "insurance_copay" ? "保険" : "自費"}</Badge></td>
                    <td className="px-4 py-2 text-right font-medium">&yen;{item.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {methodCfg && <Badge className={`${methodCfg.color} text-xs`}>{methodCfg.label}</Badge>}
                    </td>
                    <td className="px-4 py-2">
                      <Badge className={item.status === "receipted" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                        {item.status === "receipted" ? "領収済" : "精算済"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      {item.status === "paid" && (
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => issueReceipt(item.id)}>
                          <Receipt size={12} className="mr-1" /> 領収書
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
