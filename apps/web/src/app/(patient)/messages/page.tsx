"use client";

import { useState } from "react";
import { Send, User, Paperclip, Search, Bell, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  sender: "patient" | "doctor";
  timestamp: Date;
}

interface Thread {
  id: string;
  doctor: string;
  specialty: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

const threads: Thread[] = [
  { id: "1", doctor: "佐藤 一郎", specialty: "内科", lastMessage: "次回の診察時に血液検査の結果を確認しましょう。", timestamp: new Date("2026-03-28T10:30:00"), unread: 1 },
  { id: "2", doctor: "鈴木 花子", specialty: "糖尿病内科", lastMessage: "HbA1cの数値が改善傾向です。現在の治療を継続しましょう。", timestamp: new Date("2026-03-26T14:20:00"), unread: 0 },
];

const chatMessages: Message[] = [
  { id: "1", content: "先生、最近血圧が少し高めで心配です。朝の測定で135/88でした。", sender: "patient", timestamp: new Date("2026-03-28T09:00:00") },
  { id: "2", content: "ご連絡ありがとうございます。135/88は少し高めですが、すぐに危険な数値ではありません。3日ほど朝晩の血圧を記録して、次回の診察時に一緒に確認しましょう。", sender: "doctor", timestamp: new Date("2026-03-28T10:15:00") },
  { id: "3", content: "次回の診察時に血液検査の結果を確認しましょう。", sender: "doctor", timestamp: new Date("2026-03-28T10:30:00") },
];

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState<string>("1");
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">メッセージ</h1>
        <p className="text-muted-foreground text-sm mt-1">医師との連絡</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
        <Card className="lg:col-span-1 overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="検索..." className="pl-9 h-8 text-sm" />
            </div>
          </div>
          <div className="overflow-y-auto">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedThread(t.id)}
                className={`w-full p-3 text-left border-b hover:bg-gray-50 transition-colors ${
                  selectedThread === t.id ? "bg-indigo-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <User size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{t.doctor}</p>
                      {t.unread > 0 && (
                        <span className="w-5 h-5 bg-indigo-600 rounded-full text-white text-[10px] flex items-center justify-center">
                          {t.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{t.lastMessage}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {t.timestamp.toLocaleString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="p-3 border-b flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={14} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {threads.find((t) => t.id === selectedThread)?.doctor}
              </p>
              <p className="text-xs text-muted-foreground">
                {threads.find((t) => t.id === selectedThread)?.specialty}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === "patient"
                      ? "bg-indigo-600 text-white rounded-tr-md"
                      : "bg-gray-100 text-gray-800 rounded-tl-md"
                  }`}
                >
                  {msg.content}
                  <p className={`text-[10px] mt-1 ${msg.sender === "patient" ? "text-indigo-200" : "text-gray-400"}`}>
                    {msg.timestamp.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newMessage.trim()) setNewMessage("");
              }}
              className="flex gap-2"
            >
              <Button type="button" variant="ghost" size="sm">
                <Paperclip size={16} />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1"
              />
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={!newMessage.trim()}>
                <Send size={14} />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
