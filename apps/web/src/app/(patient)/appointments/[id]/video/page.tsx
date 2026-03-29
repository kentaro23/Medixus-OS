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
  Clock,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ChatMsg {
  id: string;
  sender: string;
  content: string;
  time: string;
}

export default function PatientVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: appointmentId } = use(params);
  const [status, setStatus] = useState<"waiting" | "connected" | "ended">("waiting");
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [waitingPosition, setWaitingPosition] = useState(2);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const waitTimer = setTimeout(() => {
      setWaitingPosition(1);
      setTimeout(() => {
        setWaitingPosition(0);
        setStatus("connected");
      }, 3000);
    }, 5000);

    return () => clearTimeout(waitTimer);
  }, []);

  useEffect(() => {
    if (status === "connected") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (localVideoRef.current && videoOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: micOn })
        .then((stream) => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        })
        .catch(() => {});
    }
  }, [videoOn, micOn]);

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
        sender: "あなた",
        content: chatInput,
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  }

  function endCall() {
    setStatus("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
  }

  if (status === "ended") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <Phone size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold">診察が終了しました</h1>
        <p className="text-muted-foreground">通話時間: {formatTime(elapsed)}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/appointments">
            <Button variant="outline">予約一覧へ</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700">ダッシュボードへ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-700 flex items-center gap-2">
        <Shield size={12} />
        <span>通信は暗号化されています | 録画は同意なしに行われません</span>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          {status === "waiting" ? (
            <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center text-white space-y-4">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                <div>
                  <p className="text-lg font-medium">まもなく診察が始まります</p>
                  <p className="text-sm text-gray-400 mt-1">
                    前の患者さんの診察中です（あと{waitingPosition}人）
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold">佐</span>
                  </div>
                  <p className="text-sm">佐藤 一郎 先生</p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!videoOn && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff size={20} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {formatTime(elapsed)}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-4">
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full w-14 h-14 ${!videoOn ? "bg-red-100 border-red-300" : ""}`}
              onClick={() => setVideoOn(!videoOn)}
            >
              {videoOn ? <Video size={20} /> : <VideoOff size={20} className="text-red-500" />}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full w-14 h-14 ${!micOn ? "bg-red-100 border-red-300" : ""}`}
              onClick={() => setMicOn(!micOn)}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} className="text-red-500" />}
            </Button>
            <Button variant="outline" size="lg" className="rounded-full w-14 h-14" disabled={status === "waiting"}>
              <MonitorUp size={20} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full w-14 h-14 ${chatOpen ? "bg-indigo-100 border-indigo-300" : ""}`}
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageSquare size={20} />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
              onClick={endCall}
              disabled={status === "waiting"}
            >
              <Phone size={20} className="rotate-[135deg]" />
            </Button>
          </div>
        </div>

        {chatOpen && (
          <Card className="w-72 shrink-0">
            <CardContent className="p-3 flex flex-col h-[60vh]">
              <h3 className="text-sm font-medium mb-2">チャット</h3>
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
                <Button size="sm" onClick={sendChat} className="bg-indigo-600">
                  <Send size={12} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
