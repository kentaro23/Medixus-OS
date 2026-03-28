"use client";

import {
  Pill,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const prescriptions = [
  {
    id: "RX-2026-0415",
    date: "2026-03-15",
    doctor: "佐藤 一郎",
    status: "dispensed" as const,
    isRefill: false,
    pharmacy: "さくら薬局 渋谷店",
    items: [
      { name: "アムロジピン", dosage: "5mg", frequency: "1日1回 朝食後", days: 30, quantity: "30錠" },
      { name: "メトホルミン", dosage: "500mg", frequency: "1日2回 朝夕食後", days: 30, quantity: "60錠" },
    ],
  },
  {
    id: "RX-2026-0330",
    date: "2026-03-30",
    doctor: "佐藤 一郎",
    status: "sent" as const,
    isRefill: true,
    pharmacy: "さくら薬局 渋谷店",
    items: [
      { name: "アムロジピン", dosage: "5mg", frequency: "1日1回 朝食後", days: 30, quantity: "30錠" },
      { name: "メトホルミン", dosage: "500mg", frequency: "1日2回 朝夕食後", days: 30, quantity: "60錠" },
    ],
  },
];

const statusConfig = {
  draft: { label: "作成中", icon: FileText, color: "bg-gray-100 text-gray-600" },
  signed: { label: "署名済み", icon: CheckCircle2, color: "bg-blue-100 text-blue-700" },
  sent: { label: "薬局に送信済み", icon: Truck, color: "bg-amber-100 text-amber-700" },
  dispensed: { label: "調剤済み", icon: Package, color: "bg-green-100 text-green-700" },
  cancelled: { label: "取消", icon: AlertCircle, color: "bg-red-100 text-red-600" },
};

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">処方箋</h1>
        <p className="text-muted-foreground text-sm mt-1">処方履歴と現在の処方箋</p>
      </div>

      <div className="space-y-4">
        {prescriptions.map((rx) => {
          const st = statusConfig[rx.status];
          return (
            <Card key={rx.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{rx.id}</CardTitle>
                    <Badge className={st.color}>
                      <st.icon size={12} className="mr-1" />
                      {st.label}
                    </Badge>
                    {rx.isRefill && (
                      <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                        リフィル
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{rx.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {rx.doctor} 先生 | {rx.pharmacy}
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  {rx.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Pill size={14} className="text-blue-500" />
                        <span className="font-medium">{item.name} {item.dosage}</span>
                      </div>
                      <div className="text-right text-muted-foreground">
                        <span>{item.frequency}</span>
                        <span className="ml-3">{item.days}日分 ({item.quantity})</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    <Download size={14} className="mr-1" /> PDF
                  </Button>
                  {rx.status === "sent" && (
                    <Button variant="outline" size="sm">
                      <Truck size={14} className="mr-1" /> 配送状況
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
