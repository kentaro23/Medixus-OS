"use client";

import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  type: "text" | "single_select" | "multi_select" | "number" | "image";
  text: string;
  options?: string[];
  unit?: string;
  required: boolean;
}

interface Template {
  id: string;
  title: string;
  department: string;
  questions: Question[];
  is_active: boolean;
  response_count: number;
}

const TYPE_LABELS: Record<string, string> = {
  text: "テキスト",
  single_select: "単一選択",
  multi_select: "複数選択",
  number: "数値入力",
  image: "画像添付",
};

const DEMO_TEMPLATES: Template[] = [
  {
    id: "t1",
    title: "内科一般問診票",
    department: "内科",
    is_active: true,
    response_count: 48,
    questions: [
      { id: "q1", type: "single_select", text: "本日はどのような症状でいらっしゃいましたか？", options: ["発熱", "頭痛", "腹痛", "咳・痰", "倦怠感", "その他"], required: true },
      { id: "q2", type: "text", text: "症状はいつ頃から始まりましたか？", required: true },
      { id: "q3", type: "number", text: "現在の体温は？", unit: "℃", required: false },
      { id: "q4", type: "multi_select", text: "過去にかかったことのある病気を選択してください", options: ["高血圧", "糖尿病", "心臓病", "脳卒中", "がん", "喘息", "なし"], required: true },
      { id: "q5", type: "text", text: "現在服用中のお薬はありますか？", required: false },
      { id: "q6", type: "image", text: "症状の写真があれば添付してください（任意）", required: false },
    ],
  },
  {
    id: "t2",
    title: "皮膚科問診票",
    department: "皮膚科",
    is_active: true,
    response_count: 23,
    questions: [
      { id: "q1", type: "single_select", text: "気になる部位はどこですか？", options: ["顔", "手・腕", "足", "体幹", "頭皮", "その他"], required: true },
      { id: "q2", type: "text", text: "症状はいつ頃から始まりましたか？", required: true },
      { id: "q3", type: "single_select", text: "かゆみはありますか？", options: ["強いかゆみ", "軽いかゆみ", "かゆみなし"], required: true },
      { id: "q4", type: "image", text: "患部の写真を添付してください", required: true },
    ],
  },
  {
    id: "t3",
    title: "小児科問診票",
    department: "小児科",
    is_active: true,
    response_count: 15,
    questions: [
      { id: "q1", type: "number", text: "お子様の年齢", unit: "歳", required: true },
      { id: "q2", type: "single_select", text: "主な症状は何ですか？", options: ["発熱", "咳", "鼻水", "嘔吐", "下痢", "発疹", "その他"], required: true },
      { id: "q3", type: "number", text: "現在の体温", unit: "℃", required: false },
      { id: "q4", type: "text", text: "症状はいつ頃から始まりましたか？", required: true },
      { id: "q5", type: "multi_select", text: "予防接種歴（受けたものを選択）", options: ["BCG", "四種混合", "MR", "水痘", "日本脳炎", "インフルエンザ"], required: false },
    ],
  },
];

export default function QuestionnairesPage() {
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [editing, setEditing] = useState<Template | null>(null);
  const [preview, setPreview] = useState<Template | null>(null);

  function addQuestion() {
    if (!editing) return;
    setEditing({
      ...editing,
      questions: [
        ...editing.questions,
        { id: `q-new-${Date.now()}`, type: "text", text: "", required: false },
      ],
    });
  }

  function updateQuestion(qId: string, updates: Partial<Question>) {
    if (!editing) return;
    setEditing({
      ...editing,
      questions: editing.questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)),
    });
  }

  function removeQuestion(qId: string) {
    if (!editing) return;
    setEditing({ ...editing, questions: editing.questions.filter((q) => q.id !== qId) });
  }

  function saveTemplate() {
    if (!editing) return;
    setTemplates((prev) => prev.map((t) => (t.id === editing.id ? editing : t)));
    setEditing(null);
  }

  if (preview) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">プレビュー: {preview.title}</h1>
          <Button variant="outline" onClick={() => setPreview(null)}>閉じる</Button>
        </div>
        <div className="space-y-4">
          {preview.questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-2">
                <Label className="font-medium">
                  Q{i + 1}. {q.text} {q.required && <span className="text-red-500">*</span>}
                </Label>
                {q.type === "text" && <Input placeholder="回答を入力..." disabled />}
                {q.type === "number" && (
                  <div className="flex items-center gap-2"><Input type="number" placeholder="0" disabled className="w-32" /><span className="text-sm text-muted-foreground">{q.unit}</span></div>
                )}
                {(q.type === "single_select" || q.type === "multi_select") && q.options && (
                  <div className="space-y-1">
                    {q.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input type={q.type === "single_select" ? "radio" : "checkbox"} disabled className="rounded" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "image" && (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">写真を添付</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">テンプレート編集: {editing.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview(editing)}><Eye size={16} className="mr-1" /> プレビュー</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>キャンセル</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>タイトル</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
          <div><Label>診療科</Label><Input value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} /></div>
        </div>
        <div className="space-y-3">
          {editing.questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-gray-400 cursor-grab" />
                  <span className="text-xs font-medium text-muted-foreground w-6">Q{i + 1}</span>
                  <select value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value as Question["type"] })} className="border rounded px-2 py-1 text-xs">
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                  </select>
                  <label className="flex items-center gap-1 text-xs ml-auto">
                    <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, { required: e.target.checked })} className="rounded" />
                    必須
                  </label>
                  <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}><Trash2 size={14} className="text-red-400" /></Button>
                </div>
                <Input value={q.text} onChange={(e) => updateQuestion(q.id, { text: e.target.value })} placeholder="質問文を入力..." className="text-sm" />
                {(q.type === "single_select" || q.type === "multi_select") && (
                  <div className="pl-6">
                    <Label className="text-xs">選択肢（カンマ区切り）</Label>
                    <Input value={q.options?.join(", ") || ""} onChange={(e) => updateQuestion(q.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="text-xs" placeholder="選択肢1, 選択肢2, ..." />
                  </div>
                )}
                {q.type === "number" && (
                  <div className="pl-6"><Label className="text-xs">単位</Label><Input value={q.unit || ""} onChange={(e) => updateQuestion(q.id, { unit: e.target.value })} className="text-xs w-24" /></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addQuestion}><Plus size={16} className="mr-1" /> 質問を追加</Button>
          <Button onClick={saveTemplate} className="bg-cyan-600 hover:bg-cyan-700"><Save size={16} className="mr-1" /> 保存</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Web問診票管理</h1>
          <p className="text-sm text-muted-foreground">診療科別の問診テンプレートを管理します</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.title}</CardTitle>
                <Badge variant={t.is_active ? "default" : "secondary"} className={t.is_active ? "bg-green-500" : ""}>{t.is_active ? "有効" : "無効"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{t.department}</Badge>
                <span>{t.questions.length}問</span>
                <span>|</span>
                <span>{t.response_count}件回答</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(t)} className="flex-1"><FileText size={14} className="mr-1" /> 編集</Button>
                <Button size="sm" variant="outline" onClick={() => setPreview(t)}><Eye size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
