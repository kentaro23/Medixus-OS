"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Truck,
  Package,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const prescriptions: Array<{
  id: string;
  patient: string;
  date: string;
  status: string;
  items: Array<{ name: string; frequency: string; days: number }>;
  isFirstVisit: boolean;
  notes: string;
}> = [
  {
    id: "RX-2026-0428-001",
    patient: "山田 太郎",
    date: "2026-03-28",
    status: "draft",
    items: [
      { name: "アムロジピン 5mg", frequency: "1日1回", days: 30 },
      { name: "メトホルミン 500mg", frequency: "1日2回", days: 30 },
    ],
    isFirstVisit: false,
    notes: "次回再診まで30日分",
  },
  {
    id: "RX-2026-0428-002",
    patient: "田中 美咲",
    date: "2026-03-28",
    status: "draft",
    items: [
      { name: "アムロジピン 10mg", frequency: "1日1回", days: 30 },
      { name: "アトルバスタチン 10mg", frequency: "1日1回", days: 30 },
    ],
    isFirstVisit: false,
    notes: "血圧上昇のためアムロジピン増量",
  },
  {
    id: "RX-2026-0315-001",
    patient: "山田 太郎",
    date: "2026-03-15",
    status: "dispensed",
    items: [
      { name: "アムロジピン 5mg", frequency: "1日1回", days: 30 },
      { name: "メトホルミン 500mg", frequency: "1日2回", days: 30 },
    ],
    isFirstVisit: false,
    notes: "",
  },
];

const statusConfig: Record<string, { label: string; icon: typeof Clock; class: string }> = {
  draft: { label: "作成中", icon: Clock, class: "bg-amber-100 text-amber-700" },
  signed: { label: "署名済み", icon: CheckCircle2, class: "bg-blue-100 text-blue-700" },
  sent: { label: "送信済み", icon: Truck, class: "bg-indigo-100 text-indigo-700" },
  dispensed: { label: "調剤済み", icon: Package, class: "bg-green-100 text-green-700" },
  cancelled: { label: "取消", icon: XCircle, class: "bg-red-100 text-red-600" },
};

export default function DoctorPrescriptionsPage() {
  const [tab, setTab] = useState<"pending" | "all">("pending");

  const filtered = tab === "pending"
    ? prescriptions.filter((p) => p.status === "draft" || p.status === "signed")
    : prescriptions;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">処方管理</h1>
          <p className="text-muted-foreground text-sm mt-1">処方箋の作成・承認・管理</p>
        </div>
        <Link href="/doctor/prescriptions/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus size={16} className="mr-2" /> 新規処方
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("pending")}
          className={tab === "pending" ? "bg-teal-600" : ""}
        >
          承認待ち ({prescriptions.filter((p) => p.status === "draft" || p.status === "signed").length})
        </Button>
        <Button variant={tab === "all" ? "default" : "outline"} size="sm" onClick={() => setTab("all")} className={tab === "all" ? "bg-teal-600" : ""}>
          すべて
        </Button>
      </div>

      <div className="space-y-4">
        {filtered.map((rx) => {
          const st = statusConfig[rx.status];
          return (
            <Card key={rx.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <User size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{rx.patient}</p>
                      <Badge className={st.class}>
                        <st.icon size={12} className="mr-1" />
                        {st.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{rx.id} | {rx.date}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3">
                      {rx.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">{item.frequency} | {item.days}日分</span>
                        </div>
                      ))}
                    </div>
                    {rx.notes && <p className="text-sm text-muted-foreground mb-3">{rx.notes}</p>}
                    {rx.isFirstVisit && (
                      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg flex items-center gap-2 mb-3">
                        <AlertCircle size={14} />
                        初診処方: 最大8日分制限が適用されます
                      </div>
                    )}
                    {rx.status === "draft" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                          <CheckCircle2 size={14} className="mr-1" /> 署名・承認
                        </Button>
                        <Button size="sm" variant="outline">編集</Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">却下</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
