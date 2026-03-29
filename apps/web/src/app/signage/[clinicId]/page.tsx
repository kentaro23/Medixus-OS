"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Stethoscope } from "lucide-react";

interface QueueState {
  current_number: number;
  waiting_count: number;
  estimated_wait: number;
}

interface SignageContent {
  id: string;
  type: "announcement" | "health_info" | "promotion";
  title: string;
  body?: string;
  image_url?: string;
}

const DEMO_ANNOUNCEMENTS: SignageContent[] = [
  { id: "a1", type: "announcement", title: "本日の午後は休診です", body: "午前の診察は通常通り行います。" },
  { id: "a2", type: "announcement", title: "インフルエンザ予防接種のご案内", body: "10月1日より接種開始。予約受付中です。" },
];

const DEMO_HEALTH_INFO: SignageContent[] = [
  { id: "h1", type: "health_info", title: "花粉症の季節です", body: "早めの対策が効果的です。マスク着用・帰宅時の洗顔をお勧めします。花粉飛散量が多い日は外出を控えましょう。" },
  { id: "h2", type: "health_info", title: "正しい手洗いの方法", body: "石けんをつけて20秒以上かけて丁寧に洗いましょう。指の間、爪の先、手首も忘れずに。" },
  { id: "h3", type: "health_info", title: "高血圧の予防", body: "塩分を1日6g未満に。野菜・果物を積極的に摂取し、適度な運動を心がけましょう。" },
  { id: "h4", type: "health_info", title: "睡眠の質を高めるコツ", body: "就寝前のスマートフォン使用を控え、規則正しい睡眠リズムを心がけましょう。" },
  { id: "h5", type: "health_info", title: "熱中症に注意", body: "こまめな水分補給を。のどが渇く前に飲むことが大切です。" },
];

export default function SignagePage({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = use(params);
  const [queue, setQueue] = useState<QueueState>({ current_number: 42, waiting_count: 5, estimated_wait: 15 });
  const [healthIndex, setHealthIndex] = useState(0);
  const [time, setTime] = useState(new Date());
  const [announcements] = useState(DEMO_ANNOUNCEMENTS);
  const [healthInfos] = useState(DEMO_HEALTH_INFO);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setHealthIndex((prev) => (prev + 1) % healthInfos.length);
    }, 8000);
    return () => clearInterval(slideTimer);
  }, [healthInfos.length]);

  useEffect(() => {
    const queueTimer = setInterval(() => {
      setQueue((prev) => ({
        ...prev,
        waiting_count: Math.max(0, prev.waiting_count + (Math.random() > 0.6 ? -1 : 0)),
        estimated_wait: Math.max(5, prev.estimated_wait + (Math.random() > 0.5 ? -2 : 1)),
      }));
    }, 15000);
    return () => clearInterval(queueTimer);
  }, []);

  const currentHealth = healthInfos[healthIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
            <Stethoscope size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Medixus<span className="text-cyan-400">クリニック渋谷</span>
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">
            {time.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-xs text-gray-400">
            {time.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-5 gap-4 p-6">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="flex-1 bg-white/5 backdrop-blur rounded-2xl p-8 flex flex-col justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Health Information</p>
              <h2 className="text-3xl font-bold mb-4 text-cyan-300">{currentHealth.title}</h2>
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">{currentHealth.body}</p>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {healthInfos.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === healthIndex ? "bg-cyan-400" : "bg-white/20"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-cyan-600/30 backdrop-blur rounded-2xl p-6 text-center">
            <p className="text-sm text-cyan-300 uppercase tracking-widest">現在の呼出番号</p>
            <p className="text-8xl font-bold text-white my-4 font-mono animate-pulse">
              {queue.current_number}
            </p>
            <div className="h-px bg-cyan-400/30 my-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{queue.waiting_count}</p>
                <p className="text-xs text-cyan-300">お待ちの方</p>
              </div>
              <div>
                <p className="text-3xl font-bold">約{queue.estimated_wait}<span className="text-lg">分</span></p>
                <p className="text-xs text-cyan-300">予想待ち時間</p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white/5 backdrop-blur rounded-2xl p-6">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">お知らせ</p>
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="border-l-2 border-cyan-400 pl-4">
                  <h3 className="font-medium text-cyan-300">{a.title}</h3>
                  {a.body && <p className="text-sm text-gray-400 mt-1">{a.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="px-8 py-3 bg-black/20 text-center">
        <p className="text-xs text-gray-500">
          Powered by Medixus OS | お困りの方は受付スタッフにお声がけください
        </p>
      </footer>
    </div>
  );
}
