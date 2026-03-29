"use client";

import { useState, use } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Camera, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Question {
  id: string;
  type: "text" | "single_select" | "multi_select" | "number" | "image";
  text: string;
  options?: string[];
  unit?: string;
  required: boolean;
}

const DEMO_TEMPLATES: Record<string, { title: string; questions: Question[] }> = {
  internal_medicine_v1: {
    title: "内科一般問診票",
    questions: [
      { id: "q1", type: "single_select", text: "本日はどのような症状でいらっしゃいましたか？", options: ["発熱", "頭痛", "腹痛", "咳・痰", "倦怠感", "その他"], required: true },
      { id: "q2", type: "text", text: "症状はいつ頃から始まりましたか？", required: true },
      { id: "q3", type: "number", text: "現在の体温は？", unit: "℃", required: false },
      { id: "q4", type: "multi_select", text: "過去にかかったことのある病気を選択してください", options: ["高血圧", "糖尿病", "心臓病", "脳卒中", "がん", "喘息", "なし"], required: true },
      { id: "q5", type: "text", text: "現在服用中のお薬はありますか？あれば薬名を記入してください。", required: false },
      { id: "q6", type: "text", text: "アレルギーはありますか？あれば記入してください。", required: false },
      { id: "q7", type: "image", text: "症状の写真があれば添付してください（任意）", required: false },
    ],
  },
  dermatology_v1: {
    title: "皮膚科問診票",
    questions: [
      { id: "q1", type: "single_select", text: "気になる部位はどこですか？", options: ["顔", "手・腕", "足", "体幹", "頭皮", "その他"], required: true },
      { id: "q2", type: "text", text: "症状はいつ頃から始まりましたか？", required: true },
      { id: "q3", type: "single_select", text: "かゆみはありますか？", options: ["強いかゆみ", "軽いかゆみ", "かゆみなし"], required: true },
      { id: "q4", type: "image", text: "患部の写真を添付してください", required: true },
    ],
  },
};

export default function QuestionnairePage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = use(params);
  const template = DEMO_TEMPLATES[templateId] || DEMO_TEMPLATES.internal_medicine_v1;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [completed, setCompleted] = useState(false);

  const question = template.questions[currentStep];
  const progress = ((currentStep + 1) / template.questions.length) * 100;

  function setAnswer(value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function toggleMulti(option: string) {
    const current = (answers[question.id] as string[]) || [];
    if (current.includes(option)) {
      setAnswer(current.filter((o) => o !== option));
    } else {
      setAnswer([...current, option]);
    }
  }

  function canProceed() {
    if (!question.required) return true;
    const answer = answers[question.id];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer.trim() !== "";
  }

  function next() {
    if (currentStep < template.questions.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setCompleted(true);
    }
  }

  function prev() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  if (completed) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">問診票の入力が完了しました</h1>
        <p className="text-sm text-muted-foreground">
          回答内容は医師に共有されます。ありがとうございました。
        </p>
        <Link href="/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-700">ダッシュボードへ戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-bold">{template.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentStep + 1}/{template.questions.length}
          </span>
        </div>
      </div>

      <Card className="min-h-[300px]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-2">
            <Badge className="bg-indigo-600 shrink-0">Q{currentStep + 1}</Badge>
            <p className="font-medium">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </p>
          </div>

          {question.type === "text" && (
            <textarea
              value={(answers[question.id] as string) || ""}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="回答を入力してください..."
              className="w-full border rounded-xl p-4 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          )}

          {question.type === "number" && (
            <div className="flex items-center gap-3">
              <Input
                type="number"
                step="0.1"
                value={(answers[question.id] as string) || ""}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="0"
                className="w-32 text-lg text-center"
              />
              {question.unit && <span className="text-sm text-muted-foreground">{question.unit}</span>}
            </div>
          )}

          {question.type === "single_select" && question.options && (
            <div className="space-y-2">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswer(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                    answers[question.id] === opt
                      ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-medium"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {question.type === "multi_select" && question.options && (
            <div className="space-y-2">
              {question.options.map((opt) => {
                const selected = ((answers[question.id] as string[]) || []).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-center gap-2 ${
                      selected ? "bg-indigo-50 border-indigo-400 text-indigo-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                      {selected && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "image" && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Camera size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-muted-foreground">タップして写真を撮影/選択</p>
              </div>
              {!question.required && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle size={10} /> この項目は任意です。スキップできます。
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prev} disabled={currentStep === 0} className="flex-1">
          <ArrowLeft size={16} className="mr-1" /> 前へ
        </Button>
        <Button
          onClick={next}
          disabled={question.required && !canProceed()}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          {currentStep === template.questions.length - 1 ? (
            <>完了 <CheckCircle2 size={16} className="ml-1" /></>
          ) : (
            <>次へ <ArrowRight size={16} className="ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
