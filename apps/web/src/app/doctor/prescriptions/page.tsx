"use client";

import { useState, useMemo } from "react";
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
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Pill,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const prescriptions: Array<{
  id: string;
  patient: string;
  patientId: string;
  date: string;
  status: string;
  items: Array<{ name: string; frequency: string; days: number; dosage?: string }>;
  isFirstVisit: boolean;
  notes: string;
}> = [
  {
    id: "RX-2026-0428-001",
    patient: "山田 太郎",
    patientId: "P001",
    date: "2026-04-06",
    status: "draft",
    items: [
      { name: "アムロジピン", dosage: "5mg", frequency: "1日1回 朝食後", days: 30 },
      { name: "メトホルミン", dosage: "500mg", frequency: "1日2回 朝夕食後", days: 30 },
    ],
    isFirstVisit: false,
    notes: "次回再診まで30日分。血糖値の改善を確認。",
  },
  {
    id: "RX-2026-0428-002",
    patient: "田中 美咲",
    patientId: "P002",
    date: "2026-04-06",
    status: "draft",
    items: [
      { name: "アムロジピン", dosage: "10mg", frequency: "1日1回 朝食後", days: 30 },
      { name: "アトルバスタチン", dosage: "10mg", frequency: "1日1回 就寝前", days: 30 },
    ],
    isFirstVisit: false,
    notes: "血圧上昇のためアムロジピン5mg→10mgに増量。コレステロール管理継続。",
  },
  {
    id: "RX-2026-0404-003",
    patient: "鈴木 健一",
    patientId: "P003",
    date: "2026-04-04",
    status: "signed",
    items: [
      { name: "エソメプラゾール", dosage: "20mg", frequency: "1日1回 朝食前", days: 14 },
      { name: "レバミピド", dosage: "100mg", frequency: "1日3回 毎食後", days: 14 },
    ],
    isFirstVisit: false,
    notes: "胃潰瘍の経過。2週後再診予定。",
  },
  {
    id: "RX-2026-0401-004",
    patient: "高橋 裕子",
    patientId: "P004",
    date: "2026-04-01",
    status: "sent",
    items: [
      { name: "アジスロマイシン", dosage: "500mg", frequency: "1日1回", days: 3 },
    ],
    isFirstVisit: true,
    notes: "急性気管支炎。3日後に症状確認連絡。",
  },
  {
    id: "RX-2026-0315-001",
    patient: "山田 太郎",
    patientId: "P001",
    date: "2026-03-15",
    status: "dispensed",
    items: [
      { name: "アムロジピン", dosage: "5mg", frequency: "1日1回 朝食後", days: 30 },
      { name: "メトホルミン", dosage: "500mg", frequency: "1日2回 朝夕食後", days: 30 },
    ],
    isFirstVisit: false,
    notes: "",
  },
  {
    id: "RX-2026-0310-005",
    patient: "渡辺 隆",
    patientId: "P005",
    date: "2026-03-10",
    status: "cancelled",
    items: [
      { name: "クラリスロマイシン", dosage: "200mg", frequency: "1日2回 朝夕食後", days: 7 },
    ],
    isFirstVisit: false,
    notes: "アレルギー反応により処方取消",
  },
];

const statusConfig: Record<string, { label: string; icon: typeof Clock; class: string }> = {
  draft: { label: "作成中", icon: Clock, class: "bg-amber-100 text-amber-700 border-amber-200" },
  signed: { label: "署名済み", icon: CheckCircle2, class: "bg-blue-100 text-blue-700 border-blue-200" },
  sent: { label: "薬局送信済み", icon: Truck, class: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  dispensed: { label: "調剤済み", icon: Package, class: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "取消", icon: XCircle, class: "bg-red-100 text-red-600 border-red-200" },
};

export default function DoctorPrescriptionsPage() {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  const pendingRxs = prescriptions.filter((p) => p.status === "draft" || p.status === "signed");
  const signedIds = prescriptions.filter((p) => p.status === "draft").map((p) => p.id);

  const filtered = useMemo(() => {
    const base = tab === "pending" ? pendingRxs : prescriptions;
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(
      (rx) =>
        rx.patient.toLowerCase().includes(q) ||
        rx.id.toLowerCase().includes(q) ||
        rx.items.some((i) => i.name.toLowerCase().includes(q))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search, approvedIds, prescriptions]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllDrafts() {
    setSelected(new Set(signedIds.filter((id) => !approvedIds.has(id))));
  }

  async function bulkApprove() {
    if (selected.size === 0) return;
    setBulkApproving(true);
    await new Promise((r) => setTimeout(r, 800));
    setApprovedIds((prev) => {
      const next = new Set(prev);
      selected.forEach((id) => next.add(id));
      return next;
    });
    setSelected(new Set());
    setBulkApproving(false);
  }

  const draftCount = pendingRxs.filter((p) => p.status === "draft" && !approvedIds.has(p.id)).length;
  const signedCount = prescriptions.filter((p) => p.status === "signed" || approvedIds.has(p.id)).length;
  const sentCount = prescriptions.filter((p) => p.status === "sent").length;
  const dispensedCount = prescriptions.filter((p) => p.status === "dispensed").length;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "承認待ち", count: draftCount, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
          { label: "署名済み", count: signedCount, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "薬局送信", count: sentCount, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
          { label: "調剤済み", count: dispensedCount, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          <Button
            variant={tab === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("pending")}
            className={tab === "pending" ? "bg-teal-600 hover:bg-teal-700" : ""}
          >
            承認待ち
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === "pending" ? "bg-white/20" : "bg-amber-100 text-amber-700"}`}>
              {draftCount}
            </span>
          </Button>
          <Button
            variant={tab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("all")}
            className={tab === "all" ? "bg-teal-600 hover:bg-teal-700" : ""}
          >
            すべて
          </Button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="患者名・薬品名・処方ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {tab === "pending" && draftCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <input
            type="checkbox"
            className="w-4 h-4 accent-teal-600"
            checked={selected.size === signedIds.filter((id) => !approvedIds.has(id)).length && selected.size > 0}
            onChange={(e) => {
              if (e.target.checked) selectAllDrafts();
              else setSelected(new Set());
            }}
          />
          <span className="text-sm text-amber-700 font-medium">
            {selected.size > 0 ? `${selected.size}件選択中` : "承認待ち処方を一括選択"}
          </span>
          {selected.size > 0 && (
            <Button
              size="sm"
              className="ml-auto bg-teal-600 hover:bg-teal-700"
              onClick={bulkApprove}
              disabled={bulkApproving}
            >
              {bulkApproving ? (
                <>処理中...</>
              ) : (
                <>
                  <Check size={14} className="mr-1" /> {selected.size}件を一括承認
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Prescription List */}
      <div className="space-y-3">
        {filtered.map((rx) => {
          const effectiveStatus = approvedIds.has(rx.id) ? "signed" : rx.status;
          const st = statusConfig[effectiveStatus];
          const isExpanded = expanded.has(rx.id);
          const isDraft = effectiveStatus === "draft";
          const isSelectable = isDraft;

          return (
            <Card
              key={rx.id}
              className={`transition-all ${
                isDraft ? "hover:shadow-md border-amber-100" : "hover:shadow-sm"
              } ${selected.has(rx.id) ? "ring-2 ring-teal-400" : ""}`}
            >
              <CardContent className="p-0">
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(rx.id)}
                >
                  <div className="flex items-center gap-3">
                    {isSelectable && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-teal-600 shrink-0"
                        checked={selected.has(rx.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(rx.id)}
                      />
                    )}
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{rx.patient}</p>
                        <Badge className={`${st.class} text-xs border`}>
                          <st.icon size={11} className="mr-1" />
                          {st.label}
                        </Badge>
                        {rx.isFirstVisit && (
                          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">初診</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{rx.id}</p>
                        <span className="text-muted-foreground text-xs">·</span>
                        <p className="text-xs text-muted-foreground">{rx.date}</p>
                        <span className="text-muted-foreground text-xs">·</span>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Pill size={10} />
                          {rx.items.length}剤
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3">
                    {/* Medication Table */}
                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                        <span>薬品名・用量</span>
                        <span>用法</span>
                        <span className="text-right">日数</span>
                      </div>
                      {rx.items.map((item, i) => (
                        <div
                          key={i}
                          className={`grid grid-cols-3 gap-2 px-3 py-2.5 text-sm ${
                            i < rx.items.length - 1 ? "border-b border-gray-100" : ""
                          }`}
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.dosage && <p className="text-xs text-muted-foreground">{item.dosage}</p>}
                          </div>
                          <span className="text-muted-foreground text-xs self-center">{item.frequency}</span>
                          <span className="text-right font-medium text-sm self-center">{item.days}日分</span>
                        </div>
                      ))}
                    </div>

                    {rx.isFirstVisit && (
                      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>初診処方: 最大8日分制限が適用されます（例外規定あり）</span>
                      </div>
                    )}

                    {rx.notes && (
                      <p className="text-sm text-muted-foreground bg-white border rounded-lg px-3 py-2">
                        <span className="font-medium text-gray-600 mr-1">備考:</span>{rx.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {effectiveStatus === "draft" && (
                        <>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            <CheckCircle2 size={14} className="mr-1" /> 署名・承認
                          </Button>
                          <Button size="sm" variant="outline">編集</Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 ml-auto">
                            <XCircle size={14} className="mr-1" /> 却下
                          </Button>
                        </>
                      )}
                      {effectiveStatus === "signed" && (
                        <>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            <Truck size={14} className="mr-1" /> 薬局送信
                          </Button>
                          <Link href={`/doctor/patients/${rx.patientId}`}>
                            <Button size="sm" variant="outline">
                              <User size={14} className="mr-1" /> 患者カルテ
                            </Button>
                          </Link>
                        </>
                      )}
                      {(effectiveStatus === "sent" || effectiveStatus === "dispensed") && (
                        <Link href={`/doctor/patients/${rx.patientId}`}>
                          <Button size="sm" variant="outline">
                            <User size={14} className="mr-1" /> 患者カルテ
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {search ? `"${search}" に一致する処方箋はありません` : "処方箋はありません"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
