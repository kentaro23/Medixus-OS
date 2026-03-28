/**
 * リスクスコア算出
 * 生活習慣病リスク（高血圧/糖尿病/脂質異常/CKD）、
 * 心血管イベントリスク（フラミンガムスコア参考）を算出。
 */

export interface RiskInput {
  age: number;
  gender: "male" | "female";
  vitals: {
    systolicBP?: number;
    diastolicBP?: number;
    bloodGlucose?: number;
    hba1c?: number;
    totalCholesterol?: number;
    ldlCholesterol?: number;
    hdlCholesterol?: number;
    triglycerides?: number;
    eGFR?: number;
  };
  smoking: boolean;
  familyHistory: string[];
}

export interface RiskOutput {
  overallScore: number;
  hypertensionRisk: number;
  diabetesRisk: number;
  cardiovascularRisk: number;
  components: Record<string, number>;
}

export async function calculateRiskScore(
  _input: RiskInput
): Promise<RiskOutput> {
  // TODO: Claude APIでリスクスコアリングロジックを実装
  throw new Error("Not implemented — requires ANTHROPIC_API_KEY");
}
