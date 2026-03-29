"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, AlertCircle, FileText, Pill, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ConsultationSession {
  id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  triage_level?: string;
  summary?: string;
  needs_in_person?: boolean;
  recommended_tests?: string[];
  messages?: Array<{ role: string; content: string; timestamp?: string }>;
}

const TRIAGE_CONFIG: Record<string, { label: string; color: string }> = {
  emergency: { label: "緊急", color: "bg-red-600 text-white" },
  semi_urgent: { label: "準緊急", color: "bg-orange-500 text-white" },
  routine: { label: "通常", color: "bg-blue-500 text-white" },
  observation: { label: "経過観察", color: "bg-green-500 text-white" },
};

const DEMO_SESSIONS: ConsultationSession[] = [
  {
    id: "demo-1",
    status: "completed",
    started_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3000000).toISOString(),
    triage_level: "routine",
    summary:
      "主訴: 頭痛。2-3日前からの拍動性頭痛。強度6/10。光過敏あり。片頭痛の疑い。高血圧・2型糖尿病で治療中。メトホルミン500mg・アムロジピン5mg服用中。ペニシリンアレルギーあり。オンライン診療での対応が可能。",
    needs_in_person: false,
    recommended_tests: ["血液検査（CBC、CRP）", "頭部CT/MRI（必要に応じて）"],
    messages: [
      { role: "assistant", content: "今日はどのような症状でお困りですか？" },
      { role: "user", content: "頭痛がする" },
      { role: "assistant", content: "いつ頃から症状がありますか？" },
      { role: "user", content: "2-3日前から" },
      { role: "assistant", content: "痛みの強さを10段階で教えてください。" },
      { role: "user", content: "6くらい" },
      { role: "assistant", content: "随伴症状はありますか？" },
      { role: "user", content: "光がまぶしい" },
    ],
  },
];

export default function DoctorConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params);
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [selected, setSelected] = useState<ConsultationSession | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<Record<string, "approved" | "modified" | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/ai/consultation?patient_id=${patientId}`);
        if (res.ok) {
          const data = await res.json();
          const loaded = data.sessions?.length ? data.sessions : DEMO_SESSIONS;
          setSessions(loaded);
          if (loaded.length) setSelected(loaded[0]);
        }
      } catch {
        setSessions(DEMO_SESSIONS);
        setSelected(DEMO_SESSIONS[0]);
      }
      setLoading(false);
    }
    load();
  }, [patientId]);

  function handleApprove(sessionId: string) {
    setApprovalStatus((prev) => ({ ...prev, [sessionId]: "approved" }));
  }

  function handleModify(sessionId: string) {
    setApprovalStatus((prev) => ({ ...prev, [sessionId]: "modified" }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/doctor/patients/${patientId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> 患者詳細へ
          </Button>
        </Link>
        <h1 className="text-xl font-bold">AI問診サマリー</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-start gap-2">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <p>AI問診の結果です。内容を確認し、承認または修正してください。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">問診セッション一覧</h2>
          {sessions.map((s) => (
            <Card
              key={s.id}
              className={`cursor-pointer transition-all ${selected?.id === s.id ? "ring-2 ring-teal-500" : "hover:shadow-sm"}`}
              onClick={() => setSelected(s)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  {s.triage_level && (
                    <Badge className={TRIAGE_CONFIG[s.triage_level]?.color || ""} >
                      {TRIAGE_CONFIG[s.triage_level]?.label || s.triage_level}
                    </Badge>
                  )}
                  {approvalStatus[s.id] === "approved" && (
                    <Badge className="bg-green-100 text-green-700">承認済</Badge>
                  )}
                  {approvalStatus[s.id] === "modified" && (
                    <Badge className="bg-yellow-100 text-yellow-700">修正済</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(s.started_at).toLocaleString("ja-JP")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {selected && (
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">問診結果</CardTitle>
                  <div className="flex items-center gap-2">
                    {selected.triage_level && (
                      <Badge className={TRIAGE_CONFIG[selected.triage_level]?.color || ""}>
                        {TRIAGE_CONFIG[selected.triage_level]?.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selected.summary && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">サマリー</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.summary}</p>
                  </div>
                )}

                {selected.recommended_tests && selected.recommended_tests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">推奨検査</h3>
                    <ul className="space-y-1">
                      {selected.recommended_tests.map((t) => (
                        <li key={t} className="text-sm flex items-center gap-2 text-gray-700">
                          <FileText size={12} className="text-blue-500" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-1">対面受診の必要性</h3>
                  <p className="text-sm text-gray-700">
                    {selected.needs_in_person ? "対面受診が推奨されます" : "オンライン診療で対応可能"}
                  </p>
                </div>

                {selected.messages && selected.messages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">問診の会話ログ</h3>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                      {selected.messages.map((m, i) => (
                        <div key={i} className={`text-xs ${m.role === "user" ? "text-right" : ""}`}>
                          <span className={`inline-block px-2 py-1 rounded ${m.role === "user" ? "bg-indigo-100 text-indigo-800" : "bg-white text-gray-700"}`}>
                            <strong>{m.role === "user" ? "患者" : "AI"}:</strong> {m.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {!approvalStatus[selected.id] && (
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(selected.id)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  <CheckCircle2 size={16} className="mr-2" /> サマリーを承認
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleModify(selected.id)}
                  className="flex-1"
                >
                  <FileText size={16} className="mr-2" /> 修正して承認
                </Button>
                <Link href={`/doctor/prescriptions/new?patient_id=${patientId}&consultation_id=${selected.id}`}>
                  <Button variant="outline">
                    <Pill size={16} className="mr-2" /> 処方を作成
                  </Button>
                </Link>
              </div>
            )}

            {approvalStatus[selected.id] && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
                <CheckCircle2 size={16} />
                {approvalStatus[selected.id] === "approved" ? "承認済みです" : "修正して承認済みです"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
