"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Clock,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: string[];
}

interface TriageResult {
  triage_level: "emergency" | "semi_urgent" | "routine" | "observation";
  summary: string;
  recommended_tests: string[];
  needs_in_person: boolean;
}

interface PastSession {
  id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  triage_level?: string;
  summary?: string;
}

const TRIAGE_CONFIG = {
  emergency: { label: "緊急", color: "bg-red-600 text-white", textColor: "text-red-700", desc: "119番に連絡してください" },
  semi_urgent: { label: "準緊急", color: "bg-orange-500 text-white", textColor: "text-orange-700", desc: "本日中の受診をおすすめします" },
  routine: { label: "通常", color: "bg-blue-500 text-white", textColor: "text-blue-700", desc: "オンライン診療が可能です" },
  observation: { label: "経過観察", color: "bg-green-500 text-white", textColor: "text-green-700", desc: "セルフケアで対応できる可能性があります" },
};

const QUICK_SYMPTOMS = [
  "頭痛がする",
  "お腹が痛い",
  "熱がある",
  "咳が出る",
  "動悸がする",
  "めまいがする",
  "のどが痛い",
  "胸が痛い",
];

export default function ConsultationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/consultation");
      if (res.ok) {
        const data = await res.json();
        setPastSessions(data.sessions || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function startConsultation() {
    setStarted(true);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "こんにちは。AI問診アシスタントです。\n\n今日はどのような症状でお困りですか？下のボタンから選ぶか、自由にお書きください。",
        timestamp: new Date(),
        options: QUICK_SYMPTOMS.slice(0, 4),
      },
    ]);
  }

  async function handleSend(text: string) {
    if (!text.trim() || isTyping) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.question || data.summary || "問診が完了しました。",
        timestamp: new Date(),
        options: data.options?.length ? data.options : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.is_complete) {
        setTriageResult({
          triage_level: data.triage_level || "routine",
          summary: data.summary || "",
          recommended_tests: data.recommended_tests || [],
          needs_in_person: data.needs_in_person || false,
        });
      }

      if (data.triage_level === "emergency") {
        setTriageResult({
          triage_level: "emergency",
          summary: data.summary || "緊急性の高い症状が検出されました。",
          recommended_tests: [],
          needs_in_person: true,
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "申し訳ございません。通信エラーが発生しました。もう一度お試しください。",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  if (showHistory) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
            <ArrowLeft size={16} className="mr-1" /> 戻る
          </Button>
          <h1 className="text-xl font-bold">問診履歴</h1>
        </div>
        <div className="space-y-3">
          {pastSessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">まだ問診履歴がありません</p>
          )}
          {pastSessions.map((s) => (
            <Card key={s.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {s.triage_level && (
                        <Badge className={TRIAGE_CONFIG[s.triage_level as keyof typeof TRIAGE_CONFIG]?.color || ""}>
                          {TRIAGE_CONFIG[s.triage_level as keyof typeof TRIAGE_CONFIG]?.label || s.triage_level}
                        </Badge>
                      )}
                      <Badge variant={s.status === "completed" ? "secondary" : "outline"}>
                        {s.status === "completed" ? "完了" : "進行中"}
                      </Badge>
                    </div>
                    {s.summary && <p className="text-sm text-gray-700 mt-1">{s.summary}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(s.started_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">AI問診</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Shield size={12} /> 厚労省ガイドライン準拠 | 通信暗号化済み
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>
            AIの提案は診療支援ツールです。最終的な診断・治療の判断は必ず医師が行います。
            緊急時は直ちに119番に電話してください。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-indigo-200 hover:border-indigo-400"
            onClick={startConsultation}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                <Stethoscope size={28} className="text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg">新しい問診を始める</h3>
              <p className="text-sm text-muted-foreground">
                症状をAIがヒアリングし、トリアージを行います
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowHistory(true)}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <History size={28} className="text-gray-600" />
              </div>
              <h3 className="font-semibold text-lg">問診履歴を見る</h3>
              <p className="text-sm text-muted-foreground">
                過去の問診結果を確認できます（{pastSessions.length}件）
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStarted(false);
            setMessages([]);
            setSessionId(null);
            setTriageResult(null);
          }}
        >
          <ArrowLeft size={16} className="mr-1" /> 戻る
        </Button>
        <div>
          <h1 className="text-xl font-bold">AI問診</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield size={10} /> 通信暗号化済み
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <p>AIの提案です。最終判断は医師が行います。緊急時は119番に電話してください。</p>
      </div>

      {triageResult?.triage_level === "emergency" && (
        <div className="bg-red-600 text-white rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <AlertCircle size={24} /> 緊急性の高い症状が検出されました
          </div>
          <p className="text-sm">ただちに救急車を呼んでください。</p>
          <a href="tel:119">
            <Button className="bg-white text-red-600 hover:bg-red-50 w-full">
              <Phone size={18} className="mr-2" /> 119番に電話する
            </Button>
          </a>
        </div>
      )}

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="h-[50vh] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-indigo-100" : "bg-gradient-to-br from-teal-400 to-cyan-500"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-indigo-600" />
                  ) : (
                    <Bot size={14} className="text-white" />
                  )}
                </div>
                <div className={`max-w-[75%] ${msg.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-md"
                        : "bg-gray-100 text-gray-800 rounded-tl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.options && !triageResult && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSend(opt)}
                          disabled={isTyping}
                          className="text-xs bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50"
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
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {triageResult && triageResult.triage_level !== "emergency" && (
            <div className="border-t p-4 space-y-4 bg-gray-50/80">
              <div className="flex items-center gap-3">
                <Badge className={TRIAGE_CONFIG[triageResult.triage_level].color}>
                  {TRIAGE_CONFIG[triageResult.triage_level].label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {TRIAGE_CONFIG[triageResult.triage_level].desc}
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

              {triageResult.recommended_tests.length > 0 && (
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">推奨検査</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {triageResult.recommended_tests.map((t) => (
                        <li key={t} className="text-sm flex items-center gap-2">
                          <ChevronRight size={12} className="text-blue-500" /> {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Link href="/appointments" className="flex-1">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Stethoscope size={16} className="mr-2" /> オンライン診療を予約
                  </Button>
                </Link>
                {triageResult.needs_in_person && (
                  <Button variant="outline" className="flex-1">
                    <Hospital size={16} className="mr-2" /> 対面受診を探す
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <AlertCircle size={10} />
                AIの提案です。最終判断は医師が行います。
              </p>
            </div>
          )}

          {!triageResult && started && (
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
                <Button type="submit" disabled={!input.trim() || isTyping} className="bg-indigo-600 hover:bg-indigo-700">
                  {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
