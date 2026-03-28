/**
 * AI問診エンジン
 * Claude APIを使用して、患者の症状から段階的に問診を行う。
 * 既往歴・服薬歴・アレルギー・バイタルデータを自動参照。
 */

export interface ConsultationInput {
  patientId: string;
  chiefComplaint: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  medicalHistory?: {
    allergies: string[];
    currentMedications: string[];
    pastIllnesses: string[];
  };
  vitalsSummary?: string;
}

export interface ConsultationOutput {
  response: string;
  followUpQuestions?: string[];
  isComplete: boolean;
  summary?: string;
  triageUrgency?: "emergency" | "semi_urgent" | "normal" | "observation";
  suggestedDiagnoses?: string[];
  suggestedTests?: string[];
}

export async function runConsultation(
  _input: ConsultationInput
): Promise<ConsultationOutput> {
  // TODO: Claude API呼び出しを実装
  throw new Error("Not implemented — requires ANTHROPIC_API_KEY");
}
