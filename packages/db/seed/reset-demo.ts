/**
 * デモデータ削除スクリプト
 *
 * 実行: npx tsx packages/db/seed/reset-demo.ts
 *
 * is_seed_data = true のレコードを全テーブルから削除する。
 * 本番移行前にこのスクリプトを実行すること。
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TABLES_DELETE_ORDER = [
  "signage_contents",
  "web_questionnaire_responses",
  "web_questionnaire_templates",
  "queue_entries",
  "line_connections",
  "phone_call_logs",
  "medication_logs",
  "prescription_items",
  "prescriptions",
  "lab_orders",
  "diagnoses",
  "medical_records",
  "insurance_claims",
  "payments",
  "video_sessions",
  "doctor_schedules",
  "appointments",
  "consents",
  "ai_consultations",
  "vital_alerts",
  "risk_scores",
  "vital_records",
  "health_checkups",
  "messages",
  "notifications",
  "clinic_staff",
  "patient_clinic_registrations",
  "patients",
  "doctors",
  "profiles",
  "partner_pharmacies",
  "partner_labs",
  "clinics",
];

async function resetDemo() {
  console.log("🗑️  デモデータの削除を開始...\n");

  for (const table of TABLES_DELETE_ORDER) {
    const { count, error } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .eq("is_seed_data", true);

    if (error) {
      console.error(`  ❌ ${table}: ${error.message}`);
    } else {
      console.log(`  ✅ ${table}: ${count ?? 0}件削除`);
    }
  }

  console.log("\n✅ デモデータの削除が完了しました");
}

resetDemo().catch((err) => {
  console.error("❌ リセットエラー:", err);
  process.exit(1);
});
