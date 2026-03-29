import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectEmergency, generateEmergencyResponse } from "@/lib/phone/emergency-detector";

const MOCK_AI_RESPONSES: Record<string, { purpose: string; summary: string; response: string }> = {
  予約: {
    purpose: "appointment",
    summary: "新規予約の問い合わせ。内科の受診希望。",
    response: "ご予約を承ります。ご希望の日時をお伝えください。直近の空き枠は明日の10:00と14:30でございます。",
  },
  変更: {
    purpose: "change",
    summary: "既存予約の変更依頼。",
    response: "予約の変更を承ります。現在のご予約日時と、ご希望の変更先をお伝えください。",
  },
  キャンセル: {
    purpose: "cancel",
    summary: "予約キャンセルの依頼。",
    response: "キャンセルを承ります。お名前とご予約日時をお伝えいただけますか？",
  },
  default: {
    purpose: "inquiry",
    summary: "一般的な問い合わせ。",
    response: "お問い合わせありがとうございます。ご質問の内容をお伝えください。",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      caller_phone,
      transcript,
      clinic_id,
    } = body as {
      caller_phone?: string;
      transcript: string;
      clinic_id?: string;
    };

    const emergency = detectEmergency(transcript || "");

    if (emergency.isEmergency) {
      const emergencyResponse = generateEmergencyResponse(emergency);

      if (clinic_id && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const supabase = await createClient();
        await supabase.from("phone_call_logs").insert({
          clinic_id: clinic_id || "00000000-0000-0000-0000-000000000001",
          caller_phone: caller_phone || "不明",
          call_type: "incoming",
          handler: "ai",
          purpose: "emergency",
          transcript,
          ai_summary: `緊急通報: ${emergency.matchedKeywords.join(", ")}`,
          transferred_to_staff: true,
          started_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        action: emergency.action,
        response: emergencyResponse,
        emergency: true,
        matched_keywords: emergency.matchedKeywords,
      });
    }

    let aiResult = MOCK_AI_RESPONSES.default;
    for (const [keyword, result] of Object.entries(MOCK_AI_RESPONSES)) {
      if (keyword !== "default" && transcript.includes(keyword)) {
        aiResult = result;
        break;
      }
    }

    if (clinic_id && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      await supabase.from("phone_call_logs").insert({
        clinic_id: clinic_id || "00000000-0000-0000-0000-000000000001",
        caller_phone: caller_phone || "不明",
        call_type: "incoming",
        handler: "ai",
        purpose: aiResult.purpose,
        transcript,
        ai_summary: aiResult.summary,
        transferred_to_staff: false,
        started_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      action: "normal",
      response: aiResult.response,
      purpose: aiResult.purpose,
      summary: aiResult.summary,
      emergency: false,
    });
  } catch (error) {
    console.error("Phone incoming error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
