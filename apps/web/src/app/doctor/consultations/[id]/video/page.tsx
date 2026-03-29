"use client";

import { useState, useEffect, useRef, use } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MonitorUp,
  MessageSquare,
  Send,
  Pill,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ChatMsg {
  id: string;
  sender: string;
  content: string;
  time: string;
}

const DEMO_PATIENT = {
  name: "山田 太郎",
  age: 54,
  gender: "男性",
  allergies: ["ペニシリン"],
  medications: ["メトホルミン 500mg", "アムロジピン 5mg"],
  lastVitals: { bp: "132/84", hr: "72", temp: "36.4" },
  consultationSummary: "頭痛（2-3日前から）。拍動性で光過敏あり。片頭痛の疑い。",
  triageLevel: "routine",
};

export default function DoctorVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _consultationId } = use(params);
  const [status, setStatus] = useState<"connected" | "ended">("connected");
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [sidePanel, setSidePanel] = useState<"summary" | "chat">("summary");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function sendChat() {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "あなた（医師）",
        content: chatInput,
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  }

  function endCall() {
    setStatus("ended");
    if (timerRef.current) clearInterval(timerRef.current);
  }

  if (status === "ended") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <Phone size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold">診察が終了しました</h1>
        <p className="text-muted-foreground">通話時間: {formatTime(elapsed)}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/doctor/prescriptions/new">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Pill size={16} className="mr-2" /> 処方を作成
            </Button>
          </Link>
          <Link href="/doctor/dashboard">
            <Button variant="outline">ダッシュボードへ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-4 h-[70vh]">
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1 bg-gray-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold">山</span>
                </div>
                <p>{DEMO_PATIENT.name}</p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 w-36 aspect-video bg-gray-800 rounded-lg border-2 border-white/20 flex items-center justify-center">
              {videoOn ? (
                <span className="text-white text-xs">カメラ映像</span>
              ) : (
                <VideoOff size={20} className="text-gray-400" />
              )}
            </div>

            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatTime(elapsed)}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-3">
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full w-12 h-12 ${!videoOn ? "bg-red-100 border-red-300" : ""}`}
              onClick={() => setVideoOn(!videoOn)}
            >
              {videoOn ? <Video size={18} /> : <VideoOff size={18} className="text-red-500" />}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full w-12 h-12 ${!micOn ? "bg-red-100 border-red-300" : ""}`}
              onClick={() => setMicOn(!micOn)}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} className="text-red-500" />}
            </Button>
            <Button variant="outline" size="lg" className="rounded-full w-12 h-12">
              <MonitorUp size={18} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full w-12 h-12 ${chatOpen ? "bg-teal-100 border-teal-300" : ""}`}
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageSquare size={18} />
            </Button>
            <Button size="lg" className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700" onClick={endCall}>
              <Phone size={18} className="rotate-[135deg]" />
            </Button>
            <div className="border-l pl-3 ml-2">
              <Button variant="outline" size="lg" className="rounded-full w-12 h-12">
                <Users size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-80 shrink-0 flex flex-col">
          <div className="flex gap-1 mb-2">
            <Button
              size="sm"
              variant={sidePanel === "summary" ? "default" : "outline"}
              onClick={() => setSidePanel("summary")}
              className={sidePanel === "summary" ? "bg-teal-600" : ""}
            >
              患者サマリー
            </Button>
            <Button
              size="sm"
              variant={sidePanel === "chat" ? "default" : "outline"}
              onClick={() => setSidePanel("chat")}
              className={sidePanel === "chat" ? "bg-teal-600" : ""}
            >
              チャット
            </Button>
          </div>

          {sidePanel === "summary" && (
            <Card className="flex-1 overflow-y-auto">
              <CardContent className="p-3 space-y-3">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">基本情報</h3>
                  <p className="text-sm font-medium">{DEMO_PATIENT.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {DEMO_PATIENT.age}歳 {DEMO_PATIENT.gender}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-1">AI問診サマリー</h3>
                  <div className="bg-teal-50 rounded-lg p-2">
                    <Badge className="bg-blue-500 text-white mb-1">通常</Badge>
                    <p className="text-xs text-gray-700">{DEMO_PATIENT.consultationSummary}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-1">直近バイタル</h3>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="bg-gray-50 rounded p-1.5 text-center">
                      <p className="text-muted-foreground">血圧</p>
                      <p className="font-medium">{DEMO_PATIENT.lastVitals.bp}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-1.5 text-center">
                      <p className="text-muted-foreground">心拍</p>
                      <p className="font-medium">{DEMO_PATIENT.lastVitals.hr}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-1.5 text-center">
                      <p className="text-muted-foreground">体温</p>
                      <p className="font-medium">{DEMO_PATIENT.lastVitals.temp}℃</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-1">アレルギー</h3>
                  <div className="flex gap-1 flex-wrap">
                    {DEMO_PATIENT.allergies.map((a) => (
                      <Badge key={a} variant="destructive" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-1">服薬中</h3>
                  {DEMO_PATIENT.medications.map((m) => (
                    <p key={m} className="text-xs flex items-center gap-1">
                      <Pill size={10} className="text-gray-400" /> {m}
                    </p>
                  ))}
                </div>

                <div className="pt-2 border-t space-y-1">
                  <Link href="/doctor/prescriptions/new">
                    <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-xs">
                      <Pill size={12} className="mr-1" /> 処方を作成
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {sidePanel === "chat" && (
            <Card className="flex-1 flex flex-col">
              <CardContent className="p-3 flex flex-col flex-1">
                <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">メッセージはありません</p>
                  )}
                  {chatMessages.map((m) => (
                    <div key={m.id} className="text-xs">
                      <span className="font-medium">{m.sender}</span>
                      <span className="text-muted-foreground ml-1">{m.time}</span>
                      <p className="bg-gray-100 rounded-lg px-2 py-1 mt-0.5">{m.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    placeholder="メッセージ..."
                    className="flex-1 px-2 py-1.5 text-xs border rounded-lg"
                  />
                  <Button size="sm" onClick={sendChat} className="bg-teal-600">
                    <Send size={12} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
