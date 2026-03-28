/**
 * 処方候補生成
 * 問診サマリー + 検査結果 + 既往歴から処方候補を提示。
 * 禁忌チェック・相互作用チェックを含む。
 */

export interface PrescriptionInput {
  diagnosis: string;
  patientAge: number;
  allergies: string[];
  currentMedications: string[];
  isFirstVisit: boolean;
  labResults?: Record<string, number>;
}

export interface PrescriptionSuggestion {
  medicationName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  daysSupply: number;
  contraindications: string[];
  interactions: string[];
  aiConfidence: number;
}

export async function generatePrescriptionSuggestions(
  _input: PrescriptionInput
): Promise<PrescriptionSuggestion[]> {
  // TODO: Claude APIで処方候補生成を実装
  throw new Error("Not implemented — requires ANTHROPIC_API_KEY");
}
