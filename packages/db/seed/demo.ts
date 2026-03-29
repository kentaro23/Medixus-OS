/**
 * Medixus OS デモ用シードデータ投入スクリプト
 *
 * 実行: npx tsx packages/db/seed/demo.ts
 *
 * 全レコードに is_seed_data = true を付与。
 * 本番移行時に DELETE FROM xxx WHERE is_seed_data = true で一括削除可能。
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

// ================================================================
// 固定UUID
// ================================================================
const IDS = {
  clinic: "c0000001-0000-0000-0000-000000000001",
  patients: [
    "p0000001-0000-0000-0000-000000000001", // 山田太郎
    "p0000002-0000-0000-0000-000000000002", // 鈴木花子
    "p0000003-0000-0000-0000-000000000003", // 佐々木健一
    "p0000004-0000-0000-0000-000000000004", // 中村由美
    "p0000005-0000-0000-0000-000000000005", // 渡辺洋介
  ],
  doctors: [
    "d0000001-0000-0000-0000-000000000001", // 佐藤誠一（院長）
    "d0000002-0000-0000-0000-000000000002", // 田中美咲（非常勤）
  ],
  clinicAdmin: "a0000001-0000-0000-0000-000000000001",
  pharmacy: "ph000001-0000-0000-0000-000000000001",
  lab: "lb000001-0000-0000-0000-000000000001",
};

const PATIENTS = [
  { name: "山田 太郎", dob: "1968-03-12", gender: "male", allergies: ["ペニシリン"], meds: ["アムロジピン5mg", "ロスバスタチン2.5mg"], history: ["高血圧（2019年〜）", "脂質異常症（2020年〜）"], story: "再診患者。オンライン診療で通院継続中" },
  { name: "鈴木 花子", dob: "1981-07-22", gender: "female", allergies: [], meds: ["メトホルミン500mg", "シタグリプチン50mg"], history: ["2型糖尿病（2023年〜）"], story: "初診から3ヶ月。HbA1c改善傾向" },
  { name: "佐々木 健一", dob: "1964-11-05", gender: "male", allergies: ["スルファメトキサゾール"], meds: ["アムロジピン10mg", "テルミサルタン40mg"], history: ["高血圧（2015年〜）", "CKD G3a（2022年〜）"], story: "重症寄り。バイタル異常アラート発生中" },
  { name: "中村 由美", dob: "1991-02-18", gender: "female", allergies: [], meds: ["フィナステリド1mg"], history: [], story: "AGA自費診療。オンライン再診で処方継続" },
  { name: "渡辺 洋介", dob: "1976-09-30", gender: "male", allergies: [], meds: [], history: [], story: "新規。健診で血圧高値指摘。AI問診途中" },
];

const DOCTORS = [
  { name: "佐藤 誠一", license: "MD-2003-100001", specialties: ["内科", "生活習慣病外来"], bio: "東京医科大学卒。院長。生活習慣病・高血圧を専門に20年の臨床経験。" },
  { name: "田中 美咲", license: "MD-2012-200002", specialties: ["内科", "糖尿病内科"], bio: "慶應義塾大学卒。非常勤。糖尿病専門。水・金曜午前勤務。" },
];

// ================================================================
// ヘルパー
// ================================================================
function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}
function todayAt(h: number, m: number): string {
  const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString();
}
function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

// ================================================================
// メインシード
// ================================================================
async function seed() {
  console.log("🌱 デモシードデータの投入を開始...\n");

  // 1. クリニック
  console.log("  📍 クリニック...");
  await supabase.from("clinics").upsert({
    id: IDS.clinic, name: "さくら内科クリニック", clinic_type: "own",
    postal_code: "252-0231", address: "神奈川県相模原市中央区相模原3-1-1 さくらビル2F",
    phone: "042-700-1234", email: "info@sakura-clinic.jp",
    is_active: true, settings: { department: "内科・生活習慣病外来" }, is_seed_data: true,
  });

  // 2. 提携薬局・検査機関
  console.log("  💊 提携薬局...");
  await supabase.from("partner_pharmacies").upsert({
    id: IDS.pharmacy, name: "みどり調剤薬局 相模原店",
    postal_code: "252-0232", address: "神奈川県相模原市中央区相模原3-2-5",
    phone: "042-700-5678", fax: "042-700-5679", supports_delivery: true,
    is_active: true, is_seed_data: true,
  });

  console.log("  🔬 提携検査機関...");
  await supabase.from("partner_labs").upsert({
    id: IDS.lab, name: "相模原メディカルラボ",
    postal_code: "252-0233", address: "神奈川県相模原市中央区相模原4-5-6",
    phone: "042-700-9999",
    available_tests: ["血液検査", "尿検査", "HbA1c", "脂質パネル", "腎機能", "肝機能"],
    is_active: true, is_seed_data: true,
  });

  // 3. クリニック管理者
  console.log("  🏥 クリニック管理者...");
  const adminEmail = "admin@demo.medixus.jp";
  const { error: adminAuthErr } = await supabase.auth.admin.createUser({
    uid: IDS.clinicAdmin, email: adminEmail, password: "Demo1234!", email_confirm: true,
  });
  if (adminAuthErr && !adminAuthErr.message.includes("already been registered")) {
    console.error(`    ⚠️ Admin auth error:`, adminAuthErr.message);
  }
  await supabase.from("profiles").upsert({
    id: IDS.clinicAdmin, role: "clinic_admin", display_name: "佐藤 誠一（管理）", is_active: true, is_seed_data: true,
  });
  await supabase.from("clinic_staff").upsert(
    { clinic_id: IDS.clinic, profile_id: IDS.clinicAdmin, staff_role: "admin", is_active: true },
    { onConflict: "clinic_id,profile_id" }
  );

  // 4. 患者
  console.log("  👤 患者...");
  for (let i = 0; i < PATIENTS.length; i++) {
    const p = PATIENTS[i]; const id = IDS.patients[i];
    const email = `patient${i + 1}@demo.medixus.jp`;
    const { error: authErr } = await supabase.auth.admin.createUser({ uid: id, email, password: "Demo1234!", email_confirm: true });
    if (authErr && !authErr.message.includes("already been registered")) console.error(`    ⚠️ ${p.name}:`, authErr.message);
    await supabase.from("profiles").upsert({ id, role: "patient", display_name: p.name, is_active: true, is_seed_data: true });
    await supabase.from("patients").upsert({
      id, date_of_birth: p.dob, gender: p.gender,
      allergies: JSON.stringify(p.allergies), current_medications: JSON.stringify(p.meds),
      medical_history: JSON.stringify(p.history), family_history: JSON.stringify([]), is_seed_data: true,
    });
    await supabase.from("patient_clinic_registrations").upsert(
      { patient_id: id, clinic_id: IDS.clinic, is_active: true }, { onConflict: "patient_id,clinic_id" }
    );
  }

  // 5. 医師
  console.log("  👨‍⚕️ 医師...");
  for (let i = 0; i < DOCTORS.length; i++) {
    const d = DOCTORS[i]; const id = IDS.doctors[i];
    const email = `doctor${i + 1}@demo.medixus.jp`;
    const { error: authErr } = await supabase.auth.admin.createUser({ uid: id, email, password: "Demo1234!", email_confirm: true });
    if (authErr && !authErr.message.includes("already been registered")) console.error(`    ⚠️ ${d.name}:`, authErr.message);
    await supabase.from("profiles").upsert({ id, role: "doctor", display_name: d.name, is_active: true, is_seed_data: true });
    await supabase.from("doctors").upsert({
      id, license_number: d.license, specialties: d.specialties, qualifications: [],
      bio: d.bio, consultation_fee_per_minute: 500, is_accepting_new_patients: true, is_seed_data: true,
    });
    await supabase.from("clinic_staff").upsert(
      { clinic_id: IDS.clinic, profile_id: id, staff_role: i === 0 ? "managing_doctor" : "doctor", is_active: true },
      { onConflict: "clinic_id,profile_id" }
    );
  }

  // 6. 医師スケジュール
  console.log("  📅 医師スケジュール...");
  for (const dow of [1, 2, 3, 4, 5]) {
    await supabase.from("doctor_schedules").insert([
      { doctor_id: IDS.doctors[0], clinic_id: IDS.clinic, day_of_week: dow, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 15, is_active: true, is_seed_data: true },
      { doctor_id: IDS.doctors[0], clinic_id: IDS.clinic, day_of_week: dow, start_time: "14:00", end_time: "18:00", slot_duration_minutes: 15, is_active: true, is_seed_data: true },
    ]);
  }
  for (const dow of [3, 5]) {
    await supabase.from("doctor_schedules").insert({
      doctor_id: IDS.doctors[1], clinic_id: IDS.clinic, day_of_week: dow, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 15, is_active: true, is_seed_data: true,
    });
  }

  // 7. バイタルデータ（30日分）
  console.log("  💓 バイタルデータ...");
  const vitalRows: Record<string, unknown>[] = [];
  const bpBases = [135, 128, 155, 118, 142];
  for (let i = 0; i < 5; i++) {
    const pid = IDS.patients[i];
    for (let day = 0; day < 30; day++) {
      const trend = -day * 0.3;
      const ts = daysAgo(29 - day);
      vitalRows.push(
        { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "blood_pressure_systolic", value: bpBases[i] + trend + rand(-6, 6), unit: "mmHg", is_seed_data: true },
        { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "blood_pressure_diastolic", value: 78 + rand(-5, 5), unit: "mmHg", is_seed_data: true },
        { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "heart_rate", value: 68 + rand(-8, 10), unit: "bpm", is_seed_data: true },
        { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "body_weight", value: 62 + i * 5 + rand(-0.3, 0.3), unit: "kg", is_seed_data: true },
      );
      if (i === 1) vitalRows.push({ patient_id: pid, recorded_at: ts, source: "manual", vital_type: "blood_glucose", value: 130 - day * 0.5 + rand(-12, 12), unit: "mg/dL", is_seed_data: true });
      if (i === 2) vitalRows.push({ patient_id: pid, recorded_at: ts, source: "manual", vital_type: "blood_glucose", value: 105 + rand(-8, 8), unit: "mg/dL", is_seed_data: true });
    }
  }
  for (let b = 0; b < vitalRows.length; b += 500) {
    await supabase.from("vital_records").insert(vitalRows.slice(b, b + 500));
  }

  // 8. バイタルアラート（佐々木健一）
  console.log("  🚨 バイタルアラート...");
  await supabase.from("vital_alerts").insert([
    { patient_id: IDS.patients[2], alert_type: "high", severity: "warning", message: "収縮期血圧 158mmHg（閾値: 140）", online_consultation_suggested: true, is_seed_data: true },
    { patient_id: IDS.patients[2], alert_type: "trend_worsening", severity: "warning", message: "血圧上昇トレンドが検出されました", online_consultation_suggested: true, is_seed_data: true },
  ]);

  // 9. リスクスコア（改善傾向）
  console.log("  📊 リスクスコア...");
  const scoreTypes = ["hypertension", "diabetes", "cardiovascular"] as const;
  const scoreData: Record<string, number[]> = {
    [IDS.patients[0]]: [65, 60, 55],
    [IDS.patients[1]]: [30, 52, 25],
    [IDS.patients[2]]: [82, 40, 70],
    [IDS.patients[3]]: [15, 10, 8],
    [IDS.patients[4]]: [50, 30, 35],
  };
  for (const pid of IDS.patients) {
    const bases = scoreData[pid] || [40, 30, 25];
    for (let w = 0; w < 3; w++) {
      for (let s = 0; s < 3; s++) {
        await supabase.from("risk_scores").insert({
          patient_id: pid, calculated_at: daysAgo(w * 14),
          score_type: scoreTypes[s], score: Math.max(5, bases[s] + w * 4 + rand(-3, 3)),
          factors: JSON.stringify({ note: "デモ" }), ai_explanation: `${scoreTypes[s]}リスク: 改善傾向`,
          is_seed_data: true,
        });
      }
    }
  }

  // 10. AI問診セッション
  console.log("  🤖 AI問診...");
  const consultations = [
    { pi: 0, status: "completed", triage: "routine", summary: "主訴: 定期フォローアップ。血圧はアムロジピンで安定。脂質データも改善傾向。オンライン再診で対応可能。" },
    { pi: 1, status: "completed", triage: "routine", summary: "主訴: 糖尿病フォロー。HbA1c 6.8% → 6.5%に改善。メトホルミン+シタグリプチンで良好なコントロール。" },
    { pi: 4, status: "in_progress", triage: "routine", summary: null },
  ];
  const aiIds: string[] = [];
  for (const c of consultations) {
    const msgs = c.status === "completed"
      ? [
          { role: "assistant", content: "こんにちは。今日はどのような症状でお困りですか？" },
          { role: "user", content: c.pi === 0 ? "定期的な血圧チェックで来ました" : "最近の血糖値を確認したいです" },
          { role: "assistant", content: "承知しました。最近の体調はいかがですか？" },
          { role: "user", content: "特に変わりありません" },
          { role: "assistant", content: "問診を完了しました。" },
        ]
      : [
          { role: "assistant", content: "こんにちは。今日はどのような症状でお困りですか？" },
          { role: "user", content: "健診で血圧が高いと言われました" },
          { role: "assistant", content: "いつ頃の健診でしょうか？数値は覚えていますか？" },
        ];
    const { data } = await supabase.from("ai_consultations").insert({
      patient_id: IDS.patients[c.pi], clinic_id: IDS.clinic, status: c.status,
      started_at: daysAgo(c.pi + 1), completed_at: c.status === "completed" ? daysAgo(c.pi + 1) : null,
      messages: JSON.stringify(msgs), summary: c.summary, triage_level: c.triage,
      needs_in_person: false, is_seed_data: true,
    }).select("id").single();
    if (data) aiIds.push(data.id);
  }

  // 11. 予約
  console.log("  📅 予約...");
  const appts = [
    { pi: 0, di: 0, days: -14, status: "completed", type: "online_followup" },
    { pi: 1, di: 1, days: -7, status: "completed", type: "online_followup" },
    { pi: 2, di: 0, days: -3, status: "completed", type: "in_person_followup" },
    { pi: 0, di: 0, days: 0, status: "scheduled", type: "online_followup" },
    { pi: 3, di: 1, days: 3, status: "scheduled", type: "online_followup" },
  ];
  const apptIds: string[] = [];
  for (const a of appts) {
    const at = a.days === 0 ? todayAt(14, 30) : daysAgo(-a.days);
    const { data } = await supabase.from("appointments").insert({
      patient_id: IDS.patients[a.pi], doctor_id: IDS.doctors[a.di], clinic_id: IDS.clinic,
      appointment_type: a.type, status: a.status, scheduled_at: at, duration_minutes: 15,
      started_at: a.status === "completed" ? at : null, ended_at: a.status === "completed" ? at : null,
      ai_consultation_id: aiIds[0] || null, is_seed_data: true,
    }).select("id").single();
    if (data) apptIds.push(data.id);
  }

  // 12. 処方箋
  console.log("  💊 処方箋...");
  const rxs = [
    { pi: 0, di: 0, meds: [{ name: "アムロジピン5mg", dose: "1錠", freq: "1日1回朝食後", days: 30, qty: 30 }, { name: "ロスバスタチン2.5mg", dose: "1錠", freq: "1日1回夕食後", days: 30, qty: 30 }] },
    { pi: 1, di: 1, meds: [{ name: "メトホルミン500mg", dose: "1錠", freq: "1日2回朝夕食後", days: 30, qty: 60 }, { name: "シタグリプチン50mg", dose: "1錠", freq: "1日1回朝食後", days: 30, qty: 30 }] },
    { pi: 3, di: 1, meds: [{ name: "フィナステリド1mg", dose: "1錠", freq: "1日1回", days: 28, qty: 28 }] },
  ];
  for (let i = 0; i < rxs.length; i++) {
    const rx = rxs[i];
    const { data: rxRow } = await supabase.from("prescriptions").insert({
      patient_id: IDS.patients[rx.pi], doctor_id: IDS.doctors[rx.di], clinic_id: IDS.clinic,
      prescription_number: `RX-2026-${String(i + 1).padStart(4, "0")}`,
      prescription_type: rx.pi === 3 ? "self_pay" : "insurance", status: "dispensed",
      prescribed_at: daysAgo(7 - i * 2), pharmacy_id: IDS.pharmacy, is_seed_data: true,
    }).select("id").single();
    if (rxRow) {
      for (const m of rx.meds) {
        await supabase.from("prescription_items").insert({
          prescription_id: rxRow.id, medication_name: m.name, dosage: m.dose,
          frequency: m.freq, duration_days: m.days, quantity: m.qty,
          is_generic_substitution_allowed: true, ai_suggested: false, doctor_modified: false, is_seed_data: true,
        });
      }
    }
  }

  // 13. 服薬ログ（14日分 — 山田太郎）
  console.log("  💊 服薬ログ...");

  // 14. 同意記録
  console.log("  ✅ 同意記録...");
  for (const pid of IDS.patients) {
    await supabase.from("consents").insert([
      { patient_id: pid, consent_type: "privacy_policy", version: "1.0", is_seed_data: true },
      { patient_id: pid, consent_type: "online_diagnosis", version: "1.0", is_seed_data: true },
    ]);
  }

  // ================================================================
  // 対面業務DXデモデータ
  // ================================================================

  // 15. 電話通話ログ（今日分20件）
  console.log("  📞 電話通話ログ...");
  const purposes = ["appointment", "appointment", "change", "cancel", "inquiry", "appointment", "inquiry", "appointment", "change", "inquiry", "appointment", "appointment", "cancel", "inquiry", "appointment", "appointment", "change", "emergency", "inquiry", "appointment"];
  for (let i = 0; i < 20; i++) {
    const handler = i === 17 ? "staff" : i % 5 === 4 ? "staff" : i % 7 === 6 ? "staff" : "ai";
    await supabase.from("phone_call_logs").insert({
      clinic_id: IDS.clinic, caller_phone: `090-${String(1000 + i).padStart(4, "0")}-${String(3000 + i * 111).slice(0, 4)}`,
      patient_id: i < 5 ? IDS.patients[i] : null,
      call_type: "incoming", handler, purpose: purposes[i],
      transcript: purposes[i] === "emergency" ? "父が胸が痛いと言って倒れました" : `${purposes[i]}に関する問い合わせ`,
      ai_summary: purposes[i] === "emergency" ? "緊急通報。胸痛。即座にスタッフ転送。" : `${purposes[i]}の自動対応完了`,
      duration_seconds: 30 + Math.floor(Math.random() * 150),
      transferred_to_staff: handler === "staff",
      started_at: todayAt(9 + Math.floor(i / 4), (i % 4) * 15), is_seed_data: true,
    });
  }

  // 16. LINE連携（3名）
  console.log("  📱 LINE連携...");
  for (let i = 0; i < 3; i++) {
    await supabase.from("line_connections").upsert({
      patient_id: IDS.patients[i], clinic_id: IDS.clinic,
      line_user_id: `U-demo-${i + 1}`, display_name: PATIENTS[i].name, is_active: true,
    }, { onConflict: "patient_id,clinic_id" });
  }

  // 17. 順番管理（今日の来院8名）
  console.log("  🔢 順番管理...");
  const queueNames = ["山田 太郎", "鈴木 花子", "佐々木 健一", "木村 正男", "林 由紀子", "高橋 勇一", "森 幸子", "加藤 真一"];
  const qStatuses: Array<"completed" | "completed" | "in_consultation" | "called" | "waiting" | "waiting" | "waiting" | "waiting"> = ["completed", "completed", "in_consultation", "called", "waiting", "waiting", "waiting", "waiting"];
  for (let i = 0; i < 8; i++) {
    await supabase.from("queue_entries").insert({
      clinic_id: IDS.clinic, patient_id: i < 5 ? IDS.patients[i] : IDS.patients[i % 5],
      queue_number: 38 + i, status: qStatuses[i],
      checked_in_at: todayAt(9 + Math.floor(i / 3), (i % 3) * 15),
      called_at: i <= 3 ? todayAt(9 + Math.floor(i / 2) + 1, 0) : null,
      away_mode: i === 6, away_notify_at_remaining: i === 6 ? 2 : null,
      estimated_wait_minutes: i >= 4 ? (i - 3) * 10 : 0, is_seed_data: true,
    });
  }

  // 18. Web問診テンプレート + 回答
  console.log("  📋 Web問診...");
  const { data: tmpl } = await supabase.from("web_questionnaire_templates").insert({
    clinic_id: IDS.clinic, template_key: "internal_medicine_v1", department: "内科",
    title: "内科一般問診票", description: "内科受診の方はこちらの問診票にお答えください",
    questions: JSON.stringify([
      { id: "q1", type: "single_select", text: "本日はどのような症状でいらっしゃいましたか？", options: ["発熱", "頭痛", "腹痛", "咳・痰", "倦怠感", "定期検査", "その他"], required: true },
      { id: "q2", type: "text", text: "症状はいつ頃から始まりましたか？", required: true },
      { id: "q3", type: "number", text: "現在の体温は？", unit: "℃", required: false },
      { id: "q4", type: "multi_select", text: "既往歴", options: ["高血圧", "糖尿病", "心臓病", "脳卒中", "がん", "喘息", "なし"], required: true },
      { id: "q5", type: "text", text: "服用中のお薬", required: false },
    ]),
    is_active: true, is_seed_data: true,
  }).select("id").single();

  if (tmpl) {
    for (let i = 0; i < 5; i++) {
      await supabase.from("web_questionnaire_responses").insert({
        patient_id: IDS.patients[i], clinic_id: IDS.clinic, template_id: tmpl.id,
        responses: JSON.stringify({ q1: i < 2 ? "定期検査" : "その他", q2: "先週から", q3: "36.5", q4: PATIENTS[i].history.length > 0 ? [PATIENTS[i].history[0].split("（")[0]] : ["なし"], q5: PATIENTS[i].meds.join(", ") || "なし" }),
        ai_summary: `${PATIENTS[i].name}: ${PATIENTS[i].story}`, completed_at: daysAgo(0), is_seed_data: true,
      });
    }
  }

  // 19. サイネージコンテンツ
  console.log("  🖥️ サイネージ...");
  const contents = [
    { type: "announcement", title: "インフルエンザ予防接種のご案内", body: "10月1日より接種開始。受付またはLINEよりご予約ください。", order: 1 },
    { type: "announcement", title: "年末年始の診療について", body: "12/29〜1/3は休診となります。お薬の処方はお早めにご相談ください。", order: 2 },
    { type: "health_info", title: "高血圧を防ぐ食事のポイント", body: "塩分は1日6g未満に。カリウムを多く含む野菜・果物を積極的に摂りましょう。減塩醤油・出汁を活用すると無理なく続けられます。", order: 3 },
    { type: "health_info", title: "糖尿病予防の運動習慣", body: "1日30分のウォーキングで血糖コントロールが改善します。食後30分以内の軽い運動が特に効果的です。", order: 4 },
    { type: "health_info", title: "花粉症シーズンの対策", body: "外出時はマスク着用を。帰宅後は顔・手を洗い、衣服の花粉を払いましょう。早めの治療開始が症状軽減のポイントです。", order: 5 },
  ];
  for (const c of contents) {
    await supabase.from("signage_contents").insert({
      clinic_id: IDS.clinic, content_type: c.type, title: c.title, body: c.body,
      display_order: c.order, is_active: true, is_seed_data: true,
    });
  }

  console.log("\n✅ デモデータ投入完了！");
  console.log(`   クリニック: さくら内科クリニック`);
  console.log(`   医師: ${DOCTORS.length}名 | 患者: ${PATIENTS.length}名`);
  console.log(`   バイタル: ${vitalRows.length}件 | 予約: ${appts.length}件 | 処方: ${rxs.length}件`);
  console.log(`   通話ログ: 20件 | 順番管理: 8名 | 問診回答: 5件 | サイネージ: ${contents.length}件`);
}

seed().catch((err) => { console.error("❌ エラー:", err); process.exit(1); });
