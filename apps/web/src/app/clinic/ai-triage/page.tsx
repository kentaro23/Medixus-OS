"use client";

import { useState } from "react";
import {
  Brain,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  ClipboardList,
  Sparkles,
  Copy,
  FlaskConical,
  Stethoscope,
  MessageSquare,
  X,
} from "lucide-react";
import { triageSessions, patients } from "@/lib/clinic-data";
import type { TriageSession } from "@/lib/clinic-data";

const riskColor = {
  low: { bg: "bg-green-100", text: "text-green-700", bar: "bg-green-500" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-500" },
  high: { bg: "bg-red-100", text: "text-red-700", bar: "bg-red-500" },
  critical: { bg: "bg-red-200", text: "text-red-800", bar: "bg-red-600" },
};

const riskLabel = { low: "低", medium: "中", high: "高", critical: "緊急" };

function NewTriageFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);

  const questions = [
    "最も気になる症状は何ですか？",
    "いつ頃から症状がありますか？",
    "症状は悪化していますか？それとも一定ですか？",
    "現在服用中の薬はありますか？",
    "他に気になる症状はありますか？",
  ];

  const handleAnswer = () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer("");
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-indigo-500" />
              <h2 className="text-lg font-bold">AI問診結果</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-700">62</span>
              </div>
              <div>
                <p className="font-semibold">リスクスコア: 62/100</p>
                <p className="text-sm text-amber-700">中リスク — 医師の確認推奨</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Stethoscope size={16} className="text-indigo-500" /> 推定診断
              </h3>
              <div className="flex flex-wrap gap-2">
                {["上気道感染症の疑い", "副鼻腔炎の可能性"].map((d) => (
                  <span key={d} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">{d}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <FlaskConical size={16} className="text-cyan-500" /> 推奨検査
              </h3>
              <div className="flex flex-wrap gap-2">
                {["CRP", "CBC", "インフルエンザ迅速検査"].map((t) => (
                  <span key={t} className="text-sm bg-cyan-50 text-cyan-700 px-3 py-1 rounded-lg">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <FileText size={16} className="text-emerald-500" /> カルテ下書き（SOAP）
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed border">
{`【S】${answers[0] || "—"}。${answers[1] ? `${answers[1]}から` : ""}症状出現。
${answers[2] ? `経過: ${answers[2]}。` : ""}${answers[3] ? `服薬: ${answers[3]}。` : ""}
${answers[4] ? `他症状: ${answers[4]}。` : ""}
【O】バイタル測定予定。
【A】上気道感染症疑い。副鼻腔炎鑑別要。
【P】CRP・CBC検査。症状に応じた対症療法。経過観察。`}
              </div>
              <button className="mt-2 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <Copy size={14} /> カルテにコピー
              </button>
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">閉じる</button>
            <button onClick={onClose} className="px-6 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors">
              カルテに反映
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain size={20} className="text-indigo-500" />
            <h2 className="text-lg font-bold">AI問診</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        {step === 0 && !selectedPatient ? (
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">問診対象の患者を選択してください</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors hover:border-indigo-300 ${
                    selectedPatient === p.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100"
                  }`}
                >
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.age}歳 {p.gender} · {p.conditions.join(", ")}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => { if (selectedPatient) setStep(0); }}
                disabled={!selectedPatient}
                className="px-6 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 disabled:opacity-40 transition-colors"
              >
                問診を開始
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-indigo-500 font-semibold">質問 {step + 1}/{questions.length}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-4 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Brain size={16} className="text-indigo-500" />
                </div>
                <div className="bg-indigo-50 rounded-xl rounded-tl-sm p-3 text-sm">
                  {questions[step]}
                </div>
              </div>
              {answers.slice(0, step).map((ans, i) => (
                <div key={i} className="mb-3">
                  <p className="text-xs text-gray-400 mb-1 ml-11">{questions[i]}</p>
                  <div className="flex justify-end">
                    <div className="bg-gray-100 rounded-xl rounded-tr-sm p-3 text-sm max-w-[80%]">
                      {ans}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                placeholder="患者の回答を入力..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                autoFocus
              />
              <button
                onClick={handleAnswer}
                disabled={!currentAnswer.trim()}
                className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 transition-colors"
              >
                {step < questions.length - 1 ? "次へ" : "完了"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TriageDetail({ session, onClose }: { session: TriageSession; onClose: () => void }) {
  const rc = riskColor[session.riskLevel];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{session.patientName}（{session.age}歳・{session.gender}）</h2>
            <p className="text-sm text-gray-500">主訴: {session.chiefComplaint}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl ${rc.bg} flex flex-col items-center justify-center`}>
              <span className={`text-3xl font-bold ${rc.text}`}>{session.riskScore}</span>
              <span className={`text-xs font-semibold ${rc.text}`}>{riskLabel[session.riskLevel]}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold">リスクスコア</p>
              <div className="mt-2 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${rc.bar} rounded-full transition-all`} style={{ width: `${session.riskScore}%` }} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-500" /> AI問診の対話記録
            </h3>
            <div className="space-y-3 bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
              {session.triageQuestions.map((qa, i) => (
                <div key={i}>
                  <div className="flex items-start gap-2 mb-1">
                    <Brain size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-indigo-700 font-medium">{qa.q}</p>
                  </div>
                  <div className="ml-5 bg-white rounded-lg p-2 text-sm text-gray-700 border">{qa.a}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Stethoscope size={16} className="text-indigo-500" /> 推定診断
              </h3>
              <div className="space-y-1.5">
                {session.suggestedDiagnosis.map((d) => (
                  <div key={d} className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg">
                    <ChevronRight size={14} />{d}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FlaskConical size={16} className="text-cyan-500" /> 推奨検査
              </h3>
              <div className="space-y-1.5">
                {session.suggestedTests.map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm bg-cyan-50 text-cyan-700 px-3 py-2 rounded-lg">
                    <CheckCircle2 size={14} />{t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <FileText size={16} className="text-emerald-500" /> カルテ下書き（SOAP形式）
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed border">
              {session.karteeDraft}
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <Copy size={14} /> カルテにコピー
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">閉じる</button>
          <button onClick={onClose} className="px-6 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600">
            カルテに反映
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiTriagePage() {
  const [showNew, setShowNew] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TriageSession | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Brain size={28} className="text-indigo-500" /> AI問診エンジン
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            AI問診でリスクスコアと推奨検査を自動算出。カルテ下書きを自動生成。
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Play size={16} /> 新規問診を開始
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "本日の問診", value: triageSessions.length, sub: "件", icon: <ClipboardList size={16} />, color: "indigo" },
          { label: "高リスク", value: triageSessions.filter((s) => s.riskLevel === "high" || s.riskLevel === "critical").length, sub: "件", icon: <AlertTriangle size={16} />, color: "red" },
          { label: "レビュー待ち", value: triageSessions.filter((s) => s.status === "reviewing").length, sub: "件", icon: <Clock size={16} />, color: "amber" },
          { label: "平均リスクスコア", value: Math.round(triageSessions.reduce((s, t) => s + t.riskScore, 0) / triageSessions.length), sub: "/100", icon: <Brain size={16} />, color: "indigo" },
        ].map((s) => (
          <div key={s.label} className="bg-card-bg border border-card-border rounded-2xl p-4">
            <div className={`flex items-center gap-2 text-${s.color}-500 text-sm mb-1`}>
              {s.icon} <span className="text-gray-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}<span className="text-sm text-gray-400 ml-0.5">{s.sub}</span></p>
          </div>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-2xl">
        <div className="p-4 border-b border-card-border">
          <h2 className="font-semibold">問診履歴</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {triageSessions.map((session) => {
            const rc = riskColor[session.riskLevel];
            return (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-12 h-12 rounded-xl ${rc.bg} flex flex-col items-center justify-center shrink-0`}>
                  <span className={`text-lg font-bold ${rc.text}`}>{session.riskScore}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{session.patientName}</p>
                    <span className="text-xs text-gray-400">{session.age}歳 {session.gender}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${rc.bg} ${rc.text}`}>
                      リスク: {riskLabel[session.riskLevel]}
                    </span>
                    {session.status === "reviewing" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-700">
                        レビュー待ち
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">主訴: {session.chiefComplaint}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    推定: {session.suggestedDiagnosis.join(", ")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(session.startedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <ChevronRight size={16} className="text-gray-300 mt-1 ml-auto" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showNew && <NewTriageFlow onClose={() => setShowNew(false)} />}
      {selectedSession && <TriageDetail session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  );
}
