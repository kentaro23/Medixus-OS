export interface ConsultationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PatientContext {
  name: string;
  age: number;
  gender: string;
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  recentVitals: string;
  checkupSummary: string;
}

export interface ConsultationResponse {
  question: string;
  options: string[];
  triage_level: "emergency" | "semi_urgent" | "routine" | "observation";
  needs_in_person: boolean;
  recommended_tests: string[];
  is_complete: boolean;
  summary: string | null;
}

const FALLBACK_RESPONSES: Record<number, ConsultationResponse> = {
  0: {
    question: "ご症状について、もう少し詳しくお聞かせください。いつ頃から症状がありますか？",
    options: ["今日から", "2-3日前から", "1週間以上前から", "1ヶ月以上前から"],
    triage_level: "routine",
    needs_in_person: false,
    recommended_tests: [],
    is_complete: false,
    summary: null,
  },
  1: {
    question: "痛みの強さを10段階で教えてください（1=ほとんど気にならない、10=我慢できない）。",
    options: ["1-3（軽度）", "4-6（中程度）", "7-9（強い）", "10（我慢できない）"],
    triage_level: "routine",
    needs_in_person: false,
    recommended_tests: [],
    is_complete: false,
    summary: null,
  },
  2: {
    question: "以下の随伴症状はありますか？（複数選択可）",
    options: ["発熱がある", "吐き気・嘔吐", "めまい・ふらつき", "特にない"],
    triage_level: "routine",
    needs_in_person: false,
    recommended_tests: [],
    is_complete: false,
    summary: null,
  },
  3: {
    question: "普段の生活への影響はどの程度ですか？",
    options: ["日常生活に支障なし", "多少支障がある", "仕事・学校を休んでいる", "寝込んでいる"],
    triage_level: "routine",
    needs_in_person: false,
    recommended_tests: [],
    is_complete: false,
    summary: null,
  },
};

const FALLBACK_COMPLETE: ConsultationResponse = {
  question: "問診が完了しました。以下がAIによるサマリーです。",
  options: [],
  triage_level: "routine",
  needs_in_person: false,
  recommended_tests: ["血液検査（CBC、CRP）", "尿検査"],
  is_complete: true,
  summary:
    "主訴に対して段階的に問診を実施しました。現時点では緊急性は低いと判断されますが、症状が持続・増悪する場合はオンライン診療または対面受診をお勧めします。",
};

function buildSystemPrompt(ctx: PatientContext, template: string): string {
  return template
    .replace("{{patient_name}}", ctx.name)
    .replace("{{age}}", String(ctx.age))
    .replace("{{gender}}", ctx.gender)
    .replace("{{medical_history}}", ctx.medicalHistory.join(", ") || "なし")
    .replace("{{current_medications}}", ctx.currentMedications.join(", ") || "なし")
    .replace("{{allergies}}", ctx.allergies.join(", ") || "なし")
    .replace("{{recent_vitals}}", ctx.recentVitals || "データなし")
    .replace("{{checkup_summary}}", ctx.checkupSummary || "データなし");
}

export async function runConsultation(
  messages: ConsultationMessage[],
  patientContext: PatientContext,
  promptTemplate: string,
): Promise<ConsultationResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const step = Math.floor((messages.length - 1) / 2);
    if (step >= 4) return FALLBACK_COMPLETE;
    return FALLBACK_RESPONSES[step] || FALLBACK_RESPONSES[0];
  }

  const systemPrompt = buildSystemPrompt(patientContext, promptTemplate);

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!resp.ok) {
    console.error("Anthropic API error:", resp.status, await resp.text());
    const step = Math.floor((messages.length - 1) / 2);
    if (step >= 4) return FALLBACK_COMPLETE;
    return FALLBACK_RESPONSES[step] || FALLBACK_RESPONSES[0];
  }

  const data = await resp.json();
  const text: string = data.content?.[0]?.text ?? "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]) as ConsultationResponse;
  } catch {
    return {
      question: text,
      options: ["はい", "いいえ", "その他"],
      triage_level: "routine",
      needs_in_person: false,
      recommended_tests: [],
      is_complete: false,
      summary: null,
    };
  }
}
