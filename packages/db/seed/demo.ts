/**
 * Medixus OS デモ用シードデータ投入スクリプト
 *
 * 実行: npx tsx packages/db/seed/demo.ts
 *
 * 前提:
 *   - Supabase プロジェクトが起動済み
 *   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY が環境変数に設定済み
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
// ID定義（固定UUIDでリレーション構築）
// ================================================================

const IDS = {
  clinic: "c0000001-0000-0000-0000-000000000001",
  patients: [
    "p0000001-0000-0000-0000-000000000001",
    "p0000002-0000-0000-0000-000000000002",
    "p0000003-0000-0000-0000-000000000003",
    "p0000004-0000-0000-0000-000000000004",
    "p0000005-0000-0000-0000-000000000005",
  ],
  doctors: [
    "d0000001-0000-0000-0000-000000000001",
    "d0000002-0000-0000-0000-000000000002",
  ],
  pharmacy: "ph000001-0000-0000-0000-000000000001",
  lab: "lb000001-0000-0000-0000-000000000001",
};

const PATIENTS = [
  { name: "田中 太郎", dob: "1975-06-15", gender: "male", allergies: ["ペニシリン"], meds: ["アムロジピン5mg"] },
  { name: "山田 花子", dob: "1982-03-22", gender: "female", allergies: [], meds: ["メトホルミン500mg"] },
  { name: "佐藤 一郎", dob: "1968-11-08", gender: "male", allergies: ["スルファメトキサゾール"], meds: [] },
  { name: "鈴木 美咲", dob: "1990-07-30", gender: "female", allergies: [], meds: ["レバミピド100mg"] },
  { name: "高橋 健二", dob: "1955-01-12", gender: "male", allergies: ["アスピリン"], meds: ["ワーファリン1mg", "アトルバスタチン10mg"] },
];

const DOCTORS = [
  { name: "中村 誠", license: "MD-2005-123456", specialties: ["内科", "糖尿病内科"], bio: "東京医科大学卒。糖尿病・生活習慣病を専門に15年の臨床経験。" },
  { name: "伊藤 由美", license: "MD-2010-789012", specialties: ["循環器内科", "総合内科"], bio: "慶應義塾大学医学部卒。循環器疾患とオンライン診療の推進に取り組む。" },
];

// ================================================================
// ヘルパー
// ================================================================

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

// ================================================================
// シード投入
// ================================================================

async function seed() {
  console.log("🌱 デモシードデータの投入を開始...\n");

  // 1. クリニック
  console.log("  📍 クリニック...");
  await supabase.from("clinics").upsert({
    id: IDS.clinic,
    name: "メディクスクリニック東京",
    clinic_type: "own",
    postal_code: "150-0001",
    address: "東京都渋谷区神宮前1-2-3 メディクスビル3F",
    phone: "03-1234-5678",
    email: "tokyo@medixus.jp",
    is_active: true,
    is_seed_data: true,
  });

  // 2. 提携薬局・検査機関
  console.log("  💊 提携薬局...");
  await supabase.from("partner_pharmacies").upsert({
    id: IDS.pharmacy,
    name: "さくら調剤薬局 渋谷店",
    postal_code: "150-0002",
    address: "東京都渋谷区渋谷2-1-1",
    phone: "03-9876-5432",
    fax: "03-9876-5433",
    supports_delivery: true,
    is_active: true,
    is_seed_data: true,
  });

  console.log("  🔬 提携検査機関...");
  await supabase.from("partner_labs").upsert({
    id: IDS.lab,
    name: "東京メディカルラボ",
    postal_code: "150-0003",
    address: "東京都渋谷区恵比寿3-4-5",
    phone: "03-1111-2222",
    available_tests: JSON.stringify(["血液検査", "尿検査", "HbA1c", "脂質パネル", "肝機能", "腎機能"]),
    is_active: true,
    is_seed_data: true,
  });

  // 3. プロフィール + 患者 + 医師
  // NOTE: Supabase Auth のユーザー作成は admin API 経由で行う
  console.log("  👤 プロフィール（Auth + profiles）...");

  for (let i = 0; i < PATIENTS.length; i++) {
    const p = PATIENTS[i];
    const id = IDS.patients[i];
    const email = `patient${i + 1}@demo.medixus.jp`;

    const { error: authErr } = await supabase.auth.admin.createUser({
      uid: id,
      email,
      password: "Demo1234!",
      email_confirm: true,
    });
    if (authErr && !authErr.message.includes("already been registered")) {
      console.error(`    ⚠️ Auth error for ${p.name}:`, authErr.message);
    }

    await supabase.from("profiles").upsert({
      id, role: "patient", display_name: p.name, is_active: true, is_seed_data: true,
    });

    await supabase.from("patients").upsert({
      id,
      date_of_birth: p.dob,
      gender: p.gender,
      allergies: JSON.stringify(p.allergies),
      current_medications: JSON.stringify(p.meds),
      medical_history: JSON.stringify([]),
      family_history: JSON.stringify([]),
      is_seed_data: true,
    });

    await supabase.from("patient_clinic_registrations").upsert(
      { patient_id: id, clinic_id: IDS.clinic, is_active: true },
      { onConflict: "patient_id,clinic_id" }
    );
  }

  for (let i = 0; i < DOCTORS.length; i++) {
    const d = DOCTORS[i];
    const id = IDS.doctors[i];
    const email = `doctor${i + 1}@demo.medixus.jp`;

    const { error: authErr } = await supabase.auth.admin.createUser({
      uid: id,
      email,
      password: "Demo1234!",
      email_confirm: true,
    });
    if (authErr && !authErr.message.includes("already been registered")) {
      console.error(`    ⚠️ Auth error for ${d.name}:`, authErr.message);
    }

    await supabase.from("profiles").upsert({
      id, role: "doctor", display_name: d.name, is_active: true, is_seed_data: true,
    });

    await supabase.from("doctors").upsert({
      id,
      license_number: d.license,
      specialties: d.specialties,
      qualifications: [],
      bio: d.bio,
      consultation_fee_per_minute: 500,
      is_accepting_new_patients: true,
      is_seed_data: true,
    });

    await supabase.from("clinic_staff").upsert(
      { clinic_id: IDS.clinic, profile_id: id, staff_role: i === 0 ? "managing_doctor" : "doctor", is_active: true },
      { onConflict: "clinic_id,profile_id" }
    );
  }

  // 4. バイタルデータ（患者5名 × 30日分）
  console.log("  💓 バイタルデータ（30日分）...");
  const vitalRows: Record<string, unknown>[] = [];
  for (let i = 0; i < IDS.patients.length; i++) {
    const pid = IDS.patients[i];
    const baseSystolic = 120 + i * 8;
    const baseGlucose = 90 + i * 10;

    for (let day = 0; day < 30; day++) {
      const ts = daysAgo(29 - day);
      vitalRows.push(
        { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "blood_pressure_systolic", value: baseSystolic + randomBetween(-8, 8), unit: "mmHg", is_seed_data: true },
        { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "blood_pressure_diastolic", value: 70 + randomBetween(-5, 5), unit: "mmHg", is_seed_data: true },
        { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "heart_rate", value: 65 + randomBetween(-10, 10), unit: "bpm", is_seed_data: true },
        { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "body_weight", value: 60 + i * 5 + randomBetween(-0.5, 0.5), unit: "kg", is_seed_data: true },
      );
      if (i === 1 || i === 4) {
        vitalRows.push(
          { patient_id: pid, recorded_at: ts, source: "manual", vital_type: "blood_glucose", value: baseGlucose + randomBetween(-15, 20), unit: "mg/dL", is_seed_data: true },
        );
      }
    }
  }
  const BATCH = 500;
  for (let b = 0; b < vitalRows.length; b += BATCH) {
    await supabase.from("vital_records").insert(vitalRows.slice(b, b + BATCH));
  }

  // 5. リスクスコア
  console.log("  📊 リスクスコア推移...");
  const scoreTypes = ["hypertension", "diabetes", "cardiovascular"] as const;
  for (const pid of IDS.patients) {
    for (const st of scoreTypes) {
      for (let w = 0; w < 6; w++) {
        await supabase.from("risk_scores").insert({
          patient_id: pid,
          calculated_at: daysAgo(w * 5),
          score_type: st,
          score: randomBetween(15, 75),
          factors: JSON.stringify({ note: "デモデータ" }),
          ai_explanation: `${st} リスク: デモ算出値`,
          is_seed_data: true,
        });
      }
    }
  }

  // 6. AI問診セッション（3件完了）
  console.log("  🤖 AI問診セッション...");
  const triageScenarios = [
    { patientIdx: 0, complaint: "2日前から頭痛と微熱があります", triage: "routine", summary: "軽度の風邪症状。解熱鎮痛剤で経過観察推奨。" },
    { patientIdx: 1, complaint: "最近口渇と頻尿が気になります", triage: "semi_urgent", summary: "血糖値上昇の可能性。HbA1c検査を推奨。" },
    { patientIdx: 4, complaint: "動悸と息切れが1週間続いています", triage: "semi_urgent", summary: "心房細動の疑い。循環器精査を推奨。対面受診が望ましい。" },
  ];

  const aiConsultationIds: string[] = [];
  for (const sc of triageScenarios) {
    const { data } = await supabase.from("ai_consultations").insert({
      patient_id: IDS.patients[sc.patientIdx],
      clinic_id: IDS.clinic,
      status: "completed",
      started_at: daysAgo(3),
      completed_at: daysAgo(3),
      messages: JSON.stringify([
        { role: "assistant", content: "こんにちは。今日はどのような症状でお困りですか？", timestamp: daysAgo(3) },
        { role: "user", content: sc.complaint, timestamp: daysAgo(3) },
        { role: "assistant", content: "承知しました。いくつか追加でお聞きします。いつ頃から症状が始まりましたか？", timestamp: daysAgo(3) },
        { role: "user", content: "2〜3日前からです。", timestamp: daysAgo(3) },
        { role: "assistant", content: "ありがとうございます。問診結果をまとめました。", timestamp: daysAgo(3) },
      ]),
      summary: sc.summary,
      triage_level: sc.triage,
      needs_in_person: sc.triage === "semi_urgent",
      is_seed_data: true,
    }).select("id").single();
    if (data) aiConsultationIds.push(data.id);
  }

  // 7. 予約（過去3件完了 + 未来2件予定）
  console.log("  📅 予約...");
  const appointmentIds: string[] = [];
  const appts = [
    { patientIdx: 0, doctorIdx: 0, daysOffset: -5, status: "completed", type: "online_followup" },
    { patientIdx: 1, doctorIdx: 0, daysOffset: -3, status: "completed", type: "online_initial" },
    { patientIdx: 4, doctorIdx: 1, daysOffset: -1, status: "completed", type: "in_person_initial" },
    { patientIdx: 2, doctorIdx: 0, daysOffset: 2, status: "scheduled", type: "online_initial" },
    { patientIdx: 3, doctorIdx: 1, daysOffset: 5, status: "scheduled", type: "online_followup" },
  ];

  for (let i = 0; i < appts.length; i++) {
    const a = appts[i];
    const scheduledAt = daysAgo(-a.daysOffset);
    const { data } = await supabase.from("appointments").insert({
      patient_id: IDS.patients[a.patientIdx],
      doctor_id: IDS.doctors[a.doctorIdx],
      clinic_id: IDS.clinic,
      appointment_type: a.type,
      status: a.status,
      scheduled_at: scheduledAt,
      duration_minutes: 15,
      started_at: a.status === "completed" ? scheduledAt : null,
      ended_at: a.status === "completed" ? scheduledAt : null,
      ai_consultation_id: i < aiConsultationIds.length ? aiConsultationIds[i] : null,
      is_seed_data: true,
    }).select("id").single();
    if (data) appointmentIds.push(data.id);
  }

  // 8. 処方箋（5件）
  console.log("  💊 処方箋...");
  const rxData = [
    { patientIdx: 0, doctorIdx: 0, meds: [{ name: "ロキソプロフェン60mg", dosage: "1錠", freq: "1日3回毎食後", days: 5, qty: 15 }] },
    { patientIdx: 1, doctorIdx: 0, meds: [{ name: "メトホルミン500mg", dosage: "1錠", freq: "1日2回朝夕食後", days: 30, qty: 60 }] },
    { patientIdx: 0, doctorIdx: 0, meds: [{ name: "アムロジピン5mg", dosage: "1錠", freq: "1日1回朝食後", days: 30, qty: 30 }] },
    { patientIdx: 4, doctorIdx: 1, meds: [
      { name: "ワーファリン1mg", dosage: "1錠", freq: "1日1回朝食後", days: 28, qty: 28 },
      { name: "アトルバスタチン10mg", dosage: "1錠", freq: "1日1回夕食後", days: 28, qty: 28 },
    ]},
    { patientIdx: 3, doctorIdx: 1, meds: [{ name: "レバミピド100mg", dosage: "1錠", freq: "1日3回毎食後", days: 14, qty: 42 }] },
  ];

  for (let i = 0; i < rxData.length; i++) {
    const rx = rxData[i];
    const statuses = ["dispensed", "dispensed", "sent_to_pharmacy", "doctor_approved", "draft"];
    const { data: rxRow } = await supabase.from("prescriptions").insert({
      patient_id: IDS.patients[rx.patientIdx],
      doctor_id: IDS.doctors[rx.doctorIdx],
      clinic_id: IDS.clinic,
      prescription_number: `RX-DEMO-${String(i + 1).padStart(4, "0")}`,
      prescription_type: "insurance",
      status: statuses[i],
      prescribed_at: daysAgo(10 - i * 2),
      pharmacy_id: i < 3 ? IDS.pharmacy : null,
      is_seed_data: true,
    }).select("id").single();

    if (rxRow) {
      for (const med of rx.meds) {
        await supabase.from("prescription_items").insert({
          prescription_id: rxRow.id,
          medication_name: med.name,
          dosage: med.dosage,
          frequency: med.freq,
          duration_days: med.days,
          quantity: med.qty,
          is_generic_substitution_allowed: true,
          ai_suggested: false,
          doctor_modified: false,
          is_seed_data: true,
        });
      }
    }
  }

  // 9. 同意記録
  console.log("  ✅ 同意記録...");
  for (const pid of IDS.patients) {
    await supabase.from("consents").insert([
      { patient_id: pid, consent_type: "privacy_policy", version: "1.0", is_seed_data: true },
      { patient_id: pid, consent_type: "online_diagnosis", version: "1.0", is_seed_data: true },
    ]);
  }

  console.log("\n✅ デモシードデータの投入が完了しました！");
  console.log(`   患者: ${PATIENTS.length}名`);
  console.log(`   医師: ${DOCTORS.length}名`);
  console.log(`   クリニック: 1院`);
  console.log(`   バイタルレコード: ${vitalRows.length}件`);
  console.log(`   AI問診: ${triageScenarios.length}件`);
  console.log(`   予約: ${appts.length}件`);
  console.log(`   処方箋: ${rxData.length}件`);
}

seed().catch((err) => {
  console.error("❌ シード投入エラー:", err);
  process.exit(1);
});
