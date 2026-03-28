"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  AlertCircle,
  Bot,
  User,
  Loader2,
  ArrowLeft,
  Shield,
  ChevronRight,
  Stethoscope,
  Phone,
  Hospital,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type MessageRole = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  options?: string[];
}

interface TriageResult {
  urgency: "emergency" | "semi_urgent" | "normal" | "observation";
  summary: string;
  suggestedDiagnoses: string[];
  suggestedTests: string[];
  recommendation: string;
}

const urgencyConfig = {
  emergency: { label: "緊急", color: "bg-red-500 text-white", description: "119番に連絡してください" },
  semi_urgent: { label: "準緊急", color: "bg-orange-500 text-white", description: "本日中の受診をおすすめします" },
  normal: { label: "通常", color: "bg-blue-500 text-white", description: "オンライン診療が可能です" },
  observation: { label: "経過観察", color: "bg-green-500 text-white", description: "セルフケアで対応できる可能性があります" },
};

const quickSymptoms = [
  "頭痛がする",
  "お腹が痛い",
  "熱がある",
  "咳が出る",
  "動悸がする",
  "めまいがする",
  "のどが痛い",
  "胸が痛い",
];

const AI_RESPONSES: Record<string, { reply: string; options?: string[] }> = {
  default: {
    reply: "ご症状について、もう少し詳しくお聞かせください。\n\nいつ頃から症状がありますか？",
    options: ["今日から", "2-3日前から", "1週間以上前から", "1ヶ月以上前から"],
  },
  headache: {
    reply: "頭痛についてお聞きします。\n\n痛みの性質はどのようなものですか？",
    options: ["ズキズキする（拍動性）", "締め付けられる感じ", "刺すような痛み", "鈍い痛み"],
  },
  duration: {
    reply: "承知しました。痛みの強さを10段階で教えてください（1=ほとんど気にならない、10=我慢できない）。\n\nまた、以下の随伴症状はありますか？",
    options: ["吐き気がある", "光がまぶしい", "肩こりがある", "特にない"],
  },
  severity: {
    reply: "ありがとうございます。お薬手帳を確認しました。現在服用中のメトホルミン500mgとアムロジピン5mgとの相互作用はありません。\n\n最後に、以下の既往歴について確認させてください。",
    options: ["高血圧あり（治療中）", "糖尿病あり（治療中）", "その他の持病あり", "確認完了"],
  },
};

export default function TriagePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "こんにちは。AI問診アシスタントです。\n\n今日はどのような症状でお困りですか？下のボタンから選ぶか、自由にお書きください。",
      timestamp: new Date(),
      options: quickSymptoms.slice(0, 4),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [step, setStep] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function addMessage(role: MessageRole, content: string, options?: string[]) {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role, content, timestamp: new Date(), options },
    ]);
  }

  async function handleSend(text: string) {
    if (!text.trim()) return;
    setInput("");
    addMessage("user", text);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep >= 4) {
      const result: TriageResult = {
        urgency: "normal",
        summary:
          "主訴: 頭痛。拍動性の頭痛が2-3日前から続く。強度は10段階中6程度。随伴症状として光過敏あり。高血圧・2型糖尿病で治療中。現在メトホルミン500mg、アムロジピン5mg服用中。ペニシリンアレルギーあり。直近の血圧132/84mmHg。",
        suggestedDiagnoses: ["片頭痛", "緊張型頭痛", "高血圧性頭痛"],
        suggestedTests: ["血液検査（CBC、CRP）", "頭部CT/MRI（必要に応じて）"],
        recommendation: "オンライン診療での対応が可能と考えられます。",
      };
      setTriageResult(result);
      addMessage(
        "assistant",
        "問診が完了しました。以下がAIによるトリアージ結果です。\n\n⚠️ これはAIの提案です。最終判断は医師が行います。"
      );
    } else {
      const responses = [AI_RESPONSES.headache, AI_RESPONSES.duration, AI_RESPONSES.severity, AI_RESPONSES.default];
      const resp = responses[step] || AI_RESPONSES.default;
      addMessage("assistant", resp.reply, resp.options);
    }

    setIsTyping(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> 戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">AI問診</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield size={10} /> 厚労省ガイドライン準拠 | 通信暗号化済み
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <p>
          AIの提案は診療支援ツールです。最終的な診断・治療の判断は必ず医師が行います。
          緊急時は直ちに119番に電話してください。
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="h-[55vh] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-indigo-100"
                      : "bg-gradient-to-br from-teal-400 to-cyan-500"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-indigo-600" />
                  ) : (
                    <Bot size={14} className="text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] ${
                    msg.role === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-md"
                        : "bg-gray-100 text-gray-800 rounded-tl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.options && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSend(opt)}
                          className="text-xs bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {msg.timestamp.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {triageResult && (
            <div className="border-t p-4 space-y-4 bg-gray-50/80">
              <div className="flex items-center gap-3">
                <Badge className={urgencyConfig[triageResult.urgency].color}>
                  {urgencyConfig[triageResult.urgency].label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {urgencyConfig[triageResult.urgency].description}
                </span>
              </div>

              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">問診サマリー</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">
                  <p>{triageResult.summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">推定疾患</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {triageResult.suggestedDiagnoses.map((d) => (
                        <li key={d} className="text-sm flex items-center gap-2">
                          <ChevronRight size={12} className="text-indigo-500" /> {d}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">推奨検査</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {triageResult.suggestedTests.map((t) => (
                        <li key={t} className="text-sm flex items-center gap-2">
                          <ChevronRight size={12} className="text-blue-500" /> {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3">
                <Link href="/appointments" className="flex-1">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Stethoscope size={16} className="mr-2" /> オンライン診療を予約
                  </Button>
                </Link>
                <Button variant="outline" className="flex-1">
                  <Hospital size={16} className="mr-2" /> 近くの医療機関を探す
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <AlertCircle size={10} />
                AIの提案です。最終判断は医師が行います。
              </p>
            </div>
          )}

          {!triageResult && (
            <div className="border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="症状を入力してください..."
                  className="flex-1 px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send size={16} />
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
