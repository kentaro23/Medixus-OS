"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  AlertTriangle,
  Shield,
  Search,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PrescriptionItem {
  medication: string;
  dosage: string;
  unit: string;
  frequency: string;
  route: string;
  days: number;
  noGenericSub: boolean;
}

const commonMedications = [
  "アムロジピン",
  "メトホルミン",
  "アトルバスタチン",
  "ロサルタン",
  "オメプラゾール",
  "レボフロキサシン",
  "ロキソプロフェン",
  "アセトアミノフェン",
];

export default function NewPrescriptionPage() {
  const [items, setItems] = useState<PrescriptionItem[]>([
    { medication: "", dosage: "", unit: "mg", frequency: "1日1回", route: "経口", days: 30, noGenericSub: false },
  ]);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState<{
    safe: boolean;
    warnings: string[];
  } | null>(null);

  function addItem() {
    setItems([...items, { medication: "", dosage: "", unit: "mg", frequency: "1日1回", route: "経口", days: 30, noGenericSub: false }]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof PrescriptionItem, value: string | number | boolean) {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  async function runAiCheck() {
    setAiChecking(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAiResult({
      safe: true,
      warnings: [
        "メトホルミン: eGFR < 30の場合は禁忌（直近の検査結果を確認してください）",
      ],
    });
    setAiChecking(false);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/doctor/prescriptions">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} className="mr-1" /> 戻る</Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">新規処方作成</h1>
          <p className="text-xs text-muted-foreground">処方箋を作成して患者に発行します</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">法的制約の自動チェック</p>
          <ul className="text-xs mt-1 space-y-0.5">
            <li>• 初診処方は最大8日分まで（自動制限）</li>
            <li>• 麻薬・向精神薬のオンライン処方は不可（自動ブロック）</li>
            <li>• 禁忌薬・相互作用はAIが自動チェック</li>
          </ul>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>患者情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>患者名</Label>
              <Input defaultValue="山田 太郎" />
            </div>
            <div className="space-y-2">
              <Label>診察種別</Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="visitType"
                    checked={!isFirstVisit}
                    onChange={() => setIsFirstVisit(false)}
                    className="accent-teal-600"
                  />
                  再診
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="visitType"
                    checked={isFirstVisit}
                    onChange={() => setIsFirstVisit(true)}
                    className="accent-teal-600"
                  />
                  初診
                </label>
              </div>
            </div>
          </div>
          {isFirstVisit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} />
              初診のため、処方日数は最大8日分に制限されます。
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
            <AlertTriangle size={14} />
            アレルギー: ペニシリン系（蕁麻疹 / 中等度）
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>処方内容</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus size={14} className="mr-1" /> 薬剤追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="border rounded-xl p-4 space-y-3 relative">
              {items.length > 1 && (
                <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded">
                  <X size={14} className="text-gray-400" />
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">薬剤名</Label>
                  <Input
                    value={item.medication}
                    onChange={(e) => updateItem(idx, "medication", e.target.value)}
                    placeholder="例: アムロジピン"
                    list={`meds-${idx}`}
                  />
                  <datalist id={`meds-${idx}`}>
                    {commonMedications.map((m) => <option key={m} value={m} />)}
                  </datalist>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">用量</Label>
                    <Input value={item.dosage} onChange={(e) => updateItem(idx, "dosage", e.target.value)} placeholder="5" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">単位</Label>
                    <select value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                      <option>mg</option>
                      <option>g</option>
                      <option>mL</option>
                      <option>錠</option>
                      <option>カプセル</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">用法</Label>
                  <select value={item.frequency} onChange={(e) => updateItem(idx, "frequency", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                    <option>1日1回 朝食後</option>
                    <option>1日1回 夕食後</option>
                    <option>1日1回 就寝前</option>
                    <option>1日2回 朝夕食後</option>
                    <option>1日3回 毎食後</option>
                    <option>頓用</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">投与経路</Label>
                  <select value={item.route} onChange={(e) => updateItem(idx, "route", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                    <option>経口</option>
                    <option>外用</option>
                    <option>吸入</option>
                    <option>点眼</option>
                    <option>坐薬</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">日数</Label>
                  <Input
                    type="number"
                    value={item.days}
                    onChange={(e) => updateItem(idx, "days", parseInt(e.target.value) || 0)}
                    max={isFirstVisit ? 8 : 90}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={item.noGenericSub}
                  onChange={(e) => updateItem(idx, "noGenericSub", e.target.checked)}
                  className="accent-teal-600"
                />
                後発品変更不可
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-2">
            <Label>備考</Label>
            <textarea className="w-full border rounded-xl p-3 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-teal-500/20" placeholder="薬局への特記事項..." />
          </div>

          <Button onClick={runAiCheck} variant="outline" className="w-full" disabled={aiChecking}>
            {aiChecking ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Shield size={16} className="mr-2" />
            )}
            AI安全性チェック（禁忌・相互作用）
          </Button>

          {aiResult && (
            <div className={`p-3 rounded-xl border text-sm ${aiResult.safe ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                {aiResult.safe ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <AlertTriangle size={16} className="text-red-600" />
                )}
                <span className="font-medium">
                  {aiResult.safe ? "重大な禁忌はありません" : "注意が必要です"}
                </span>
              </div>
              {aiResult.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 flex items-start gap-1.5 ml-6">
                  <AlertCircle size={10} className="shrink-0 mt-0.5" /> {w}
                </p>
              ))}
              <p className="text-xs text-muted-foreground mt-2 ml-6 flex items-center gap-1">
                <AlertCircle size={10} /> AIの提案です。最終判断は医師が行います。
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
              <CheckCircle2 size={16} className="mr-2" /> 署名して発行
            </Button>
            <Button variant="outline" className="flex-1">
              下書き保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
