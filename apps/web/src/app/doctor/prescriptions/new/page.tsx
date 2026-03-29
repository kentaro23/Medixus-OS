"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Pill,
  Search,
  Send,
  Building2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PrescriptionItem {
  id: string;
  medication_name: string;
  medication_code: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  quantity: number;
  is_generic_substitution_allowed: boolean;
  ai_suggested: boolean;
  notes: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  supports_delivery: boolean;
  phone: string;
}

interface SafetyCheck {
  type: string;
  status: "pass" | "warn" | "block";
  message: string;
}

const COMMON_MEDICATIONS = [
  { name: "ロキソプロフェン 60mg", code: "YJ-1149019F1ZZZ", category: "鎮痛剤" },
  { name: "アムロジピン 5mg", code: "YJ-2171022F1ZZZ", category: "降圧剤" },
  { name: "メトホルミン 500mg", code: "YJ-3962001F1ZZZ", category: "糖尿病薬" },
  { name: "レバミピド 100mg", code: "YJ-2329023F1ZZZ", category: "胃薬" },
  { name: "アセトアミノフェン 200mg", code: "YJ-1141007F1ZZZ", category: "解熱鎮痛剤" },
  { name: "フェキソフェナジン 60mg", code: "YJ-4490027F1ZZZ", category: "抗アレルギー" },
  { name: "モンテルカスト 10mg", code: "YJ-4490030F1ZZZ", category: "抗アレルギー" },
  { name: "ランソプラゾール 15mg", code: "YJ-2329024F1ZZZ", category: "PPI" },
];

const DEMO_PHARMACIES: Pharmacy[] = [
  { id: "p1", name: "調剤薬局メディカル 渋谷店", address: "東京都渋谷区道玄坂1-2-3", supports_delivery: true, phone: "03-1234-5678" },
  { id: "p2", name: "さくら薬局 恵比寿店", address: "東京都渋谷区恵比寿西1-4-5", supports_delivery: false, phone: "03-2345-6789" },
  { id: "p3", name: "トモズ 代官山店", address: "東京都渋谷区代官山町15-6", supports_delivery: true, phone: "03-3456-7890" },
];

const BLOCKED_CATEGORIES = ["麻薬", "向精神薬"];

export default function NewPrescriptionPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(COMMON_MEDICATIONS);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>([]);
  const [step, setStep] = useState<"edit" | "review" | "pharmacy" | "done">("edit");
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isInitial, setIsInitial] = useState(false);
  const [patientAllergies] = useState(["ペニシリン"]);
  const [patientMedications] = useState(["メトホルミン 500mg", "アムロジピン 5mg"]);

  useEffect(() => {
    const consultationId = searchParams.get("consultation_id");
    if (consultationId) {
      setItems([
        {
          id: "ai-1",
          medication_name: "ロキソプロフェン 60mg",
          medication_code: "YJ-1149019F1ZZZ",
          dosage: "60mg",
          frequency: "1日3回毎食後",
          duration_days: 5,
          quantity: 15,
          is_generic_substitution_allowed: true,
          ai_suggested: true,
          notes: "",
        },
        {
          id: "ai-2",
          medication_name: "レバミピド 100mg",
          medication_code: "YJ-2329023F1ZZZ",
          dosage: "100mg",
          frequency: "1日3回毎食後",
          duration_days: 5,
          quantity: 15,
          is_generic_substitution_allowed: true,
          ai_suggested: true,
          notes: "胃粘膜保護のため併用",
        },
      ]);
    }
  }, [searchParams]);

  function runSafetyChecks(currentItems: PrescriptionItem[]): SafetyCheck[] {
    const checks: SafetyCheck[] = [];

    for (const item of currentItems) {
      if (patientAllergies.some((a) => item.medication_name.toLowerCase().includes(a.toLowerCase()))) {
        checks.push({
          type: "allergy",
          status: "block",
          message: `${item.medication_name}: 患者はアレルギー（${patientAllergies.join(", ")}）があります`,
        });
      }

      if (BLOCKED_CATEGORIES.some((c) => item.notes.includes(c) || item.medication_name.includes(c))) {
        checks.push({
          type: "blocked",
          status: "block",
          message: `${item.medication_name}: 麻薬・向精神薬はオンライン処方不可`,
        });
      }

      if (isInitial && item.duration_days > 8) {
        checks.push({
          type: "initial_limit",
          status: "warn",
          message: `${item.medication_name}: 初診処方は8日分まで（現在${item.duration_days}日分）`,
        });
      }
    }

    if (checks.length === 0) {
      checks.push({ type: "all_pass", status: "pass", message: "全てのチェックを通過しました" });
    }

    return checks;
  }

  function addMedication(med: { name: string; code: string }) {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        medication_name: med.name,
        medication_code: med.code,
        dosage: med.name.split(" ").pop() || "",
        frequency: "1日3回毎食後",
        duration_days: 5,
        quantity: 15,
        is_generic_substitution_allowed: true,
        ai_suggested: false,
        notes: "",
      },
    ]);
    setSearchQuery("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, updates: Partial<PrescriptionItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }

  function handleReview() {
    const checks = runSafetyChecks(items);
    setSafetyChecks(checks);
    setStep("review");
  }

  function handleConfirm() {
    if (safetyChecks.some((c) => c.status === "block")) return;
    setStep("pharmacy");
  }

  function handleSendToPharmacy() {
    setStep("done");
  }

  useEffect(() => {
    if (searchQuery) {
      setSearchResults(
        COMMON_MEDICATIONS.filter(
          (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.category.includes(searchQuery)
        )
      );
    } else {
      setSearchResults(COMMON_MEDICATIONS);
    }
  }, [searchQuery]);

  if (step === "done") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">処方箋を送信しました</h1>
        <p className="text-muted-foreground">
          {selectedPharmacy?.name || "選択された薬局"}に処方データを送信しました。
          {selectedPharmacy?.supports_delivery && "配送対応の薬局です。"}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/doctor/prescriptions">
            <Button variant="outline">処方一覧へ</Button>
          </Link>
          <Link href="/doctor/dashboard">
            <Button className="bg-teal-600 hover:bg-teal-700">ダッシュボードへ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/doctor/prescriptions">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> 戻る
          </Button>
        </Link>
        <h1 className="text-xl font-bold">新規処方作成</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-start gap-2">
        <Shield size={16} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">法的チェック自動実行</p>
          <p className="text-xs mt-0.5">禁忌チェック・初診処方8日分制限・麻薬/向精神薬ブロックが自動で適用されます</p>
        </div>
      </div>

      {step === "edit" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">患者情報</CardTitle>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isInitial}
                    onChange={(e) => setIsInitial(e.target.checked)}
                    className="rounded"
                  />
                  初診
                </label>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">アレルギー:</span>{" "}
                {patientAllergies.map((a) => (
                  <Badge key={a} variant="destructive" className="text-xs mr-1">
                    {a}
                  </Badge>
                ))}
              </p>
              <p>
                <span className="text-muted-foreground">服薬中:</span> {patientMedications.join(", ")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">処方内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill size={16} className="text-teal-600" />
                      <span className="font-medium text-sm">{item.medication_name}</span>
                      {item.ai_suggested && (
                        <Badge variant="outline" className="text-xs text-teal-700 border-teal-300">
                          AI提案
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">用量</Label>
                      <Input
                        value={item.dosage}
                        onChange={(e) => updateItem(item.id, { dosage: e.target.value })}
                        className="text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">用法</Label>
                      <select
                        value={item.frequency}
                        onChange={(e) => updateItem(item.id, { frequency: e.target.value })}
                        className="w-full border rounded-md px-2 py-1 text-sm h-8"
                      >
                        <option>1日3回毎食後</option>
                        <option>1日2回朝夕食後</option>
                        <option>1日1回朝食後</option>
                        <option>1日1回就寝前</option>
                        <option>症状時頓服</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">日数</Label>
                      <Input
                        type="number"
                        value={item.duration_days}
                        onChange={(e) =>
                          updateItem(item.id, {
                            duration_days: Number(e.target.value),
                            quantity: Number(e.target.value) * (item.frequency.includes("3回") ? 3 : item.frequency.includes("2回") ? 2 : 1),
                          })
                        }
                        className="text-sm h-8"
                        min={1}
                        max={90}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">数量</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                        className="text-sm h-8"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.is_generic_substitution_allowed}
                      onChange={(e) =>
                        updateItem(item.id, { is_generic_substitution_allowed: e.target.checked })
                      }
                      className="rounded"
                    />
                    後発品への変更可
                  </label>
                </div>
              ))}

              <div className="border-t pt-3">
                <Label className="text-xs mb-1 block">薬剤を追加</Label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="薬剤名で検索..."
                    className="pl-9 text-sm"
                  />
                </div>
                {searchQuery && (
                  <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                    {searchResults.map((med) => (
                      <button
                        key={med.code}
                        onClick={() => addMedication(med)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex justify-between items-center"
                      >
                        <span>{med.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {med.category}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleReview}
            disabled={items.length === 0}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            安全性チェック + 確認へ
          </Button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">安全性チェック結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {safetyChecks.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 p-3 rounded-lg ${
                    check.status === "pass"
                      ? "bg-green-50"
                      : check.status === "warn"
                        ? "bg-yellow-50"
                        : "bg-red-50"
                  }`}
                >
                  {check.status === "pass" && <CheckCircle2 size={16} className="text-green-600 mt-0.5" />}
                  {check.status === "warn" && <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />}
                  {check.status === "block" && <XCircle size={16} className="text-red-600 mt-0.5" />}
                  <span
                    className={`text-sm ${
                      check.status === "pass" ? "text-green-700" : check.status === "warn" ? "text-yellow-700" : "text-red-700"
                    }`}
                  >
                    {check.message}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">処方内容の最終確認</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2">薬剤名</th>
                    <th className="pb-2">用量</th>
                    <th className="pb-2">用法</th>
                    <th className="pb-2">日数</th>
                    <th className="pb-2">数量</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{item.medication_name}</td>
                      <td className="py-2">{item.dosage}</td>
                      <td className="py-2">{item.frequency}</td>
                      <td className="py-2">{item.duration_days}日</td>
                      <td className="py-2">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("edit")} className="flex-1">
              <ArrowLeft size={16} className="mr-1" /> 編集に戻る
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={safetyChecks.some((c) => c.status === "block")}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              <CheckCircle2 size={16} className="mr-2" /> 処方を確定
            </Button>
          </div>
        </div>
      )}

      {step === "pharmacy" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">薬局を選択</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_PHARMACIES.map((ph) => (
                <div
                  key={ph.id}
                  onClick={() => setSelectedPharmacy(ph)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedPharmacy?.id === ph.id ? "ring-2 ring-teal-500 bg-teal-50/50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Building2 size={14} className="text-teal-600" />
                        {ph.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ph.address}</p>
                      <p className="text-xs text-muted-foreground">TEL: {ph.phone}</p>
                    </div>
                    {ph.supports_delivery && (
                      <Badge variant="outline" className="text-xs text-teal-700 border-teal-300">
                        <Truck size={10} className="mr-1" /> 配送対応
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("review")} className="flex-1">
              <ArrowLeft size={16} className="mr-1" /> 戻る
            </Button>
            <Button
              onClick={handleSendToPharmacy}
              disabled={!selectedPharmacy}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              <Send size={16} className="mr-2" /> 薬局に送信
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
