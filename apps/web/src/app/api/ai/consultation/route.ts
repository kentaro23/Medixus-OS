import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PROMPT_TEMPLATE = `あなたは医療問診AIです。以下の制約に従ってください。

## 制約
- あなたは「診療支援ツール」です。診断は行いません。最終判断は必ず医師が行います。
- 患者に「あなたは○○病です」と断定しないでください。
- 緊急性が高い症状を検知したら、即座にtriage_levelをemergencyにしてください。
- 質問は1回につき1問。選択肢を提示してください。
- 20問以内で完了するようにしてください。

## 患者情報
{{patient_context}}

## 出力形式（必ずJSON形式で返答）
{"question":"...","options":["..."],"triage_level":"routine","needs_in_person":false,"recommended_tests":[],"is_complete":false,"summary":null}

triage_level: emergency | semi_urgent | routine | observation
is_complete=trueの場合、summaryに主訴・経過・トリアージ判定・推奨検査を含めてください。`;

const MOCK_RESPONSES = [
  {
    question: "ご症状について、もう少し詳しくお聞かせください。いつ頃から症状がありますか？",
    options: ["今日から", "2-3日前から", "1週間以上前から", "1ヶ月以上前から"],
    triage_level: "routine" as const,
    needs_in_person: false,
    recommended_tests: [] as string[],
    is_complete: false,
    summary: null as string | null,
  },
  {
    question: "痛みや不快感の強さを10段階で教えてください。",
    options: ["1-3（軽度）", "4-6（中程度）", "7-9（強い）", "10（我慢できない）"],
    triage_level: "routine" as const,
    needs_in_person: false,
    recommended_tests: [],
    is_complete: false,
    summary: null,
  },
  {
    question: "以下の随伴症状はありますか？",
    options: ["発熱がある", "吐き気・嘔吐", "めまい・ふらつき", "特にない"],
    triage_level: "routine" as const,
    needs_in_person: false,
    recommended_tests: [],
    is_complete: false,
    summary: null,
  },
  {
    question: "普段の生活への影響はどの程度ですか？",
    options: ["日常生活に支障なし", "多少支障がある", "仕事・学校を休んでいる", "寝込んでいる"],
    triage_level: "routine" as const,
    needs_in_person: false,
    recommended_tests: [],
    is_complete: false,
    summary: null,
  },
  {
    question: "問診が完了しました。",
    options: [],
    triage_level: "routine" as const,
    needs_in_person: false,
    recommended_tests: ["血液検査（CBC、CRP）", "尿検査"],
    is_complete: true,
    summary:
      "患者は数日前からの症状を訴えています。緊急性は低く、オンライン診療での対応が可能と判断されます。症状が持続・増悪する場合は対面受診をお勧めします。",
  },
];

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, message, patient_id } = body as {
      session_id?: string;
      message: string;
      patient_id?: string;
    };

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    let existingMessages: Array<{ role: string; content: string }> = [];
    let currentSessionId = session_id;
    let patientContext = "情報なし";

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const pid = patient_id || user.id;

      const { data: patient } = await supabase
        .from("patients")
        .select("*, profiles!inner(display_name)")
        .eq("id", pid)
        .single();

      if (patient) {
        const age = patient.date_of_birth
          ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31557600000)
          : 0;
        patientContext = [
          `氏名: ${(patient as Record<string, unknown>).profiles ? ((patient as Record<string, unknown>).profiles as Record<string, string>).display_name : "不明"}`,
          `年齢: ${age}歳`,
          `性別: ${patient.gender || "不明"}`,
          `既往歴: ${JSON.stringify(patient.medical_history || [])}`,
          `服薬中: ${JSON.stringify(patient.current_medications || [])}`,
          `アレルギー: ${JSON.stringify(patient.allergies || [])}`,
        ].join("\n");
      }

      if (currentSessionId) {
        const { data: session } = await supabase
          .from("ai_consultations")
          .select("messages")
          .eq("id", currentSessionId)
          .single();
        if (session?.messages) {
          existingMessages = session.messages as Array<{ role: string; content: string }>;
        }
      } else {
        const { data: newSession } = await supabase
          .from("ai_consultations")
          .insert({
            patient_id: pid,
            status: "in_progress",
            messages: [],
          })
          .select("id")
          .single();
        currentSessionId = newSession?.id;
      }
    } else {
      currentSessionId = currentSessionId || crypto.randomUUID();
    }

    const allMessages = [...existingMessages, { role: "user", content: message }];

    let aiResponse;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (anthropicKey) {
      try {
        const systemPrompt = PROMPT_TEMPLATE.replace("{{patient_context}}", patientContext);
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: allMessages.map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            })),
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const text: string = data.content?.[0]?.text ?? "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiResponse = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (e) {
        console.error("Anthropic API error:", e);
      }
    }

    if (!aiResponse) {
      const step = Math.floor(allMessages.filter((m) => m.role === "user").length);
      aiResponse = MOCK_RESPONSES[Math.min(step - 1, MOCK_RESPONSES.length - 1)] || MOCK_RESPONSES[0];
    }

    const updatedMessages = [
      ...allMessages,
      { role: "assistant", content: aiResponse.question, timestamp: new Date().toISOString() },
    ];

    if (isSupabaseConfigured() && currentSessionId) {
      const supabase = await createClient();
      const updateData: Record<string, unknown> = { messages: updatedMessages };

      if (aiResponse.is_complete) {
        updateData.status = "completed";
        updateData.completed_at = new Date().toISOString();
        updateData.summary = aiResponse.summary;
        updateData.triage_level = aiResponse.triage_level;
        updateData.recommended_tests = aiResponse.recommended_tests;
        updateData.needs_in_person = aiResponse.needs_in_person;
        updateData.suggested_prescriptions = [];
      }

      if (aiResponse.triage_level) {
        updateData.triage_level = aiResponse.triage_level;
      }

      await supabase.from("ai_consultations").update(updateData).eq("id", currentSessionId);
    }

    return NextResponse.json({
      session_id: currentSessionId,
      ...aiResponse,
    });
  } catch (error) {
    console.error("Consultation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      sessions: [
        {
          id: "demo-1",
          status: "completed",
          started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          completed_at: new Date(Date.now() - 86400000 * 2 + 600000).toISOString(),
          triage_level: "routine",
          summary: "頭痛の問診。片頭痛の疑い。オンライン診療で対応可能。",
        },
        {
          id: "demo-2",
          status: "completed",
          started_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          completed_at: new Date(Date.now() - 86400000 * 7 + 900000).toISOString(),
          triage_level: "observation",
          summary: "軽度の喉の痛み。経過観察で改善の見込み。",
        },
      ],
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = supabase
    .from("ai_consultations")
    .select("id, status, started_at, completed_at, triage_level, summary, needs_in_person")
    .order("created_at", { ascending: false });

  if (patientId) {
    query.eq("patient_id", patientId);
  } else {
    query.eq("patient_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data || [] });
}
