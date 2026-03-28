/**
 * トリアージ判定
 * 問診結果から緊急度を判定する。
 */

export type TriageLevel = "emergency" | "semi_urgent" | "normal" | "observation";

export interface TriageInput {
  chiefComplaint: string;
  conversationSummary: string;
  vitals?: {
    systolicBP?: number;
    heartRate?: number;
    bodyTemperature?: number;
    spo2?: number;
  };
}

export interface TriageOutput {
  urgency: TriageLevel;
  reason: string;
  recommendedAction: string;
  shouldRecommendInPerson: boolean;
}

export async function triagePatient(
  _input: TriageInput
): Promise<TriageOutput> {
  // TODO: Claude APIでトリアージ判定を実装
  throw new Error("Not implemented — requires ANTHROPIC_API_KEY");
}
