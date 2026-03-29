const EMERGENCY_KEYWORDS = [
  "胸が痛い",
  "息ができない",
  "意識がない",
  "大量出血",
  "呼吸困難",
  "倒れた",
  "痙攣",
  "けいれん",
  "動けない",
  "アナフィラキシー",
  "心臓が",
  "脳卒中",
  "心筋梗塞",
  "呼吸が止",
  "意識を失",
  "血が止まらない",
  "顔が歪",
  "ろれつが回らない",
  "激痛",
];

export interface EmergencyResult {
  isEmergency: boolean;
  matchedKeywords: string[];
  action: "transfer_staff" | "suggest_119" | "normal";
}

export function detectEmergency(transcript: string): EmergencyResult {
  const lower = transcript.toLowerCase();
  const matched = EMERGENCY_KEYWORDS.filter((kw) => lower.includes(kw));

  if (matched.length === 0) {
    return { isEmergency: false, matchedKeywords: [], action: "normal" };
  }

  const critical = ["意識がない", "呼吸困難", "息ができない", "大量出血", "心臓が", "脳卒中", "心筋梗塞", "呼吸が止"];
  const isCritical = matched.some((kw) => critical.includes(kw));

  return {
    isEmergency: true,
    matchedKeywords: matched,
    action: isCritical ? "suggest_119" : "transfer_staff",
  };
}

export function generateEmergencyResponse(result: EmergencyResult): string {
  if (result.action === "suggest_119") {
    return "大変危険な状態の可能性があります。今すぐ119番に電話して救急車を呼んでください。スタッフにもお繋ぎします。";
  }
  if (result.action === "transfer_staff") {
    return "緊急性のある症状が検出されました。ただちにスタッフにお繋ぎいたします。少々お待ちください。";
  }
  return "";
}
