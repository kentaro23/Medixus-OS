/**
 * POST /api/phone/incoming
 *
 * medixus-ai-phone（Twilio + OpenAI Realtime）から送られてくる通話結果を受け取り、
 * Medixus OS の phone_call_logs に保存する。
 *
 * 受け付けるフォーマット（2種類）:
 *   1. medixus-ai-phone の call_XXX.json をそのままPOST（call_type付き構造化データ）
 *   2. 従来の { caller_phone, transcript, clinic_id }（後方互換）
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectEmergency } from "@/lib/phone/emergency-detector";

// --- medixus-ai-phone の出力フォーマット型 ---
interface AiPhoneCallResult {
  call_sid?: string;
  caller_phone?: string;
  clinic_name?: string;
  called_at?: string;
  call_type: "予約" | "キャンセル" | "変更" | "処方箋" | "問い合わせ" | "その他" | "未分類";
  patient_name?: string;
  call_summary?: string;
  requires_callback?: boolean;
  reservation?: {
    visit_type?: "初診" | "再診";
    preferred_date?: string; // YYYY-MM-DD
    preferred_time?: string; // HH:MM
    symptoms?: string;
  } | null;
  cancellation?: {
    existing_date?: string;
    existing_time?: string;
  } | null;
  change_request?: {
    existing_date?: string;
    existing_time?: string;
    new_date?: string;
    new_time?: string;
  } | null;
  inquiry_content?: string | null;
  conversation_log?: Array<{ role: string; text: string; timestamp: string }>;
}

// call_type → Medixus OS の purpose フィールドへのマッピング
const CALL_TYPE_TO_PURPOSE: Record<string, string> = {
  予約: "appointment",
  キャンセル: "cancel",
  変更: "change",
  処方箋: "prescription",
  問い合わせ: "inquiry",
  その他: "inquiry",
  未分類: "inquiry",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // --- フォーマット判別 ---
    const isStructured = "call_type" in body; // medixus-ai-phone フォーマット

    if (isStructured) {
      return await handleStructuredCall(body as AiPhoneCallResult, request);
    } else {
      return await handleLegacyCall(body, request);
    }
  } catch (error) {
    console.error("Phone incoming error:", error);
    return NextResponse.json({ error: "通話データの処理に失敗しました" }, { status: 500 });
  }
}

// ===== medixus-ai-phone フォーマット（構造化データ）=====
async function handleStructuredCall(data: AiPhoneCallResult, _request: NextRequest) {
  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clinicId = "00000000-0000-0000-0000-000000000001"; // TODO: clinic_name → clinic_id 解決

  // 緊急キーワードチェック（call_summary と inquiry_content を対象）
  const textToCheck = [data.call_summary, data.inquiry_content].filter(Boolean).join(" ");
  const emergency = detectEmergency(textToCheck);

  // DB保存
  if (supabaseConfigured) {
    const supabase = await createClient();

    // phone_call_logs に保存
    const { error: logError } = await supabase.from("phone_call_logs").insert({
      clinic_id: clinicId,
      caller_phone: data.caller_phone || "不明",
      call_type: "incoming",
      handler: "ai",
      purpose: emergency.isEmergency ? "emergency" : (CALL_TYPE_TO_PURPOSE[data.call_type] ?? "inquiry"),
      transcript: data.conversation_log
        ? data.conversation_log.map((l) => `[${l.role}] ${l.text}`).join("\n")
        : data.call_summary || "",
      ai_summary: buildSummary(data),
      transferred_to_staff: data.requires_callback ?? false,
      started_at: data.called_at || new Date().toISOString(),
      // 追加フィールド（phone_call_logs に patient_name, call_result JSONB があれば）
      ...(data.patient_name ? { patient_name: data.patient_name } : {}),
    });

    if (logError) {
      console.error("phone_call_logs insert error:", logError);
    }

    // 予約の場合は appointments テーブルにも仮予約を作成
    if (data.call_type === "予約" && data.reservation?.preferred_date) {
      const appointmentDatetime = `${data.reservation.preferred_date}T${data.reservation.preferred_time ?? "09:00"}:00`;
      const { error: apptError } = await supabase.from("appointments").insert({
        clinic_id: clinicId,
        patient_name_temp: data.patient_name || "電話予約",
        appointment_datetime: appointmentDatetime,
        visit_type: data.reservation.visit_type === "初診" ? "first_visit" : "return_visit",
        chief_complaint: data.reservation.symptoms || "",
        status: "pending_confirmation", // スタッフが確認待ち
        notes: `AI電話受付による予約。担当スタッフの確認が必要です。\n通話サマリ: ${data.call_summary}`,
        created_via: "phone_ai",
      });

      if (apptError) {
        // appointments テーブルの列名が違う場合など、エラーはログのみ（予約自体は phone_call_logs に残る）
        console.error("appointment insert error (non-critical):", apptError.message);
      }
    }
  }

  return NextResponse.json({
    success: true,
    call_type: data.call_type,
    purpose: CALL_TYPE_TO_PURPOSE[data.call_type] ?? "inquiry",
    requires_callback: data.requires_callback,
    emergency: emergency.isEmergency,
    summary: buildSummary(data),
  });
}

// ===== 従来フォーマット（後方互換）=====
async function handleLegacyCall(
  body: { caller_phone?: string; transcript?: string; clinic_id?: string },
  _request: NextRequest
) {
  const { caller_phone, transcript = "", clinic_id } = body;

  const emergency = detectEmergency(transcript);

  const purposeMap: Record<string, { purpose: string; summary: string }> = {
    予約: { purpose: "appointment", summary: "新規予約の問い合わせ" },
    変更: { purpose: "change", summary: "予約変更の依頼" },
    キャンセル: { purpose: "cancel", summary: "予約キャンセルの依頼" },
  };

  let result = { purpose: "inquiry", summary: "一般的な問い合わせ" };
  for (const [kw, val] of Object.entries(purposeMap)) {
    if (transcript.includes(kw)) { result = val; break; }
  }

  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseConfigured) {
    const supabase = await createClient();
    await supabase.from("phone_call_logs").insert({
      clinic_id: clinic_id || "00000000-0000-0000-0000-000000000001",
      caller_phone: caller_phone || "不明",
      call_type: "incoming",
      handler: "ai",
      purpose: emergency.isEmergency ? "emergency" : result.purpose,
      transcript,
      ai_summary: emergency.isEmergency
        ? `緊急通報: ${emergency.matchedKeywords.join(", ")}`
        : result.summary,
      transferred_to_staff: emergency.isEmergency,
      started_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    purpose: emergency.isEmergency ? "emergency" : result.purpose,
    emergency: emergency.isEmergency,
    matched_keywords: emergency.matchedKeywords,
  });
}

// 通話サマリを組み立てる
function buildSummary(data: AiPhoneCallResult): string {
  const parts: string[] = [];
  if (data.call_type) parts.push(`【${data.call_type}】`);
  if (data.patient_name) parts.push(data.patient_name + "様");
  if (data.call_summary) parts.push(data.call_summary);
  if (data.reservation?.preferred_date) {
    parts.push(`希望日時: ${data.reservation.preferred_date} ${data.reservation.preferred_time ?? ""}`);
  }
  if (data.cancellation?.existing_date) {
    parts.push(`キャンセル対象: ${data.cancellation.existing_date} ${data.cancellation.existing_time ?? ""}`);
  }
  if (data.change_request?.new_date) {
    parts.push(`変更希望: ${data.change_request.new_date} ${data.change_request.new_time ?? ""}`);
  }
  if (data.inquiry_content) parts.push(`内容: ${data.inquiry_content}`);
  if (data.requires_callback) parts.push("※折り返し連絡が必要");
  return parts.join(" / ");
}
