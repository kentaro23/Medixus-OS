import { NextRequest, NextResponse } from "next/server";

const SIMULATION_SCENARIOS = [
  { caller: "090-1234-5678", transcript: "明日の午前中に予約を取りたいのですが", expected_purpose: "appointment" },
  { caller: "090-2345-6789", transcript: "来週の月曜日の予約を水曜日に変更したいです", expected_purpose: "change" },
  { caller: "090-3456-7890", transcript: "金曜日の予約をキャンセルしたいのですが", expected_purpose: "cancel" },
  { caller: "090-4567-8901", transcript: "診療時間を教えてください", expected_purpose: "inquiry" },
  { caller: "090-5678-9012", transcript: "父が胸が痛いと言って倒れました", expected_purpose: "emergency" },
  { caller: "090-6789-0123", transcript: "インフルエンザの予防接種はやっていますか", expected_purpose: "inquiry" },
  { caller: "090-7890-1234", transcript: "処方箋の追加をお願いしたいのですが", expected_purpose: "inquiry" },
  { caller: "090-8901-2345", transcript: "子供が息ができないと言っています", expected_purpose: "emergency" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { scenario_index } = body as { scenario_index?: number };

    const idx = scenario_index !== undefined
      ? scenario_index % SIMULATION_SCENARIOS.length
      : Math.floor(Math.random() * SIMULATION_SCENARIOS.length);

    const scenario = SIMULATION_SCENARIOS[idx];

    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/phone/incoming`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caller_phone: scenario.caller,
        transcript: scenario.transcript,
        clinic_id: "00000000-0000-0000-0000-000000000001",
      }),
    });

    const result = await res.json();

    return NextResponse.json({
      simulation: scenario,
      result,
    });
  } catch (error) {
    console.error("Phone simulate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
