export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "男性" | "女性";
  conditions: string[];
  lastVisit: string;
  nextVisit?: string;
  phone: string;
  vitals?: {
    bp: string;
    hr: number;
    glucose?: number;
    weight: number;
    spo2: number;
  };
  medications: Medication[];
  testResults: TestResult[];
  riskLevel: "low" | "medium" | "high";
  onlineEligible: boolean;
  monitoringDevices: string[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
}

export interface TestResult {
  id: string;
  name: string;
  date: string;
  status: "completed" | "pending" | "ordered";
  lab?: string;
  value?: string;
  unit?: string;
  reference?: string;
  flag?: "normal" | "high" | "low" | "critical";
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: "initial" | "follow-up" | "online" | "monitoring-review";
  status: "scheduled" | "waiting" | "in-progress" | "completed" | "cancelled" | "no-show";
  reason: string;
  doctor: string;
  duration: number;
  notes?: string;
}

export interface TriageSession {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  startedAt: string;
  status: "in-progress" | "completed" | "reviewing";
  chiefComplaint: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  suggestedTests: string[];
  suggestedDiagnosis: string[];
  karteeDraft: string;
  triageQuestions: { q: string; a: string }[];
}

export interface VitalAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: "blood_pressure" | "heart_rate" | "glucose" | "weight" | "spo2";
  value: string;
  threshold: string;
  severity: "warning" | "critical";
  timestamp: string;
  acknowledged: boolean;
  note?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  medications: { name: string; dosage: string; days: number; instructions: string }[];
  status: "draft" | "sent" | "dispensed";
  pharmacy?: string;
  doctor: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderedAt: string;
  lab: string;
  tests: string[];
  status: "ordered" | "received" | "in-progress" | "completed";
  results?: { test: string; value: string; unit: string; flag: string }[];
  estimatedCompletion?: string;
}

export const patients: Patient[] = [
  {
    id: "p-001",
    name: "佐々木 正雄",
    age: 62,
    gender: "男性",
    conditions: ["2型糖尿病", "高血圧"],
    lastVisit: "2026-10-15",
    nextVisit: "2026-11-15",
    phone: "090-1234-5678",
    vitals: { bp: "148/92", hr: 78, glucose: 186, weight: 78.5, spo2: 97 },
    medications: [
      { name: "メトホルミン", dosage: "500mg", frequency: "1日2回", startDate: "2025-03-01" },
      { name: "アムロジピン", dosage: "5mg", frequency: "1日1回", startDate: "2025-06-15" },
    ],
    testResults: [
      { id: "t-001", name: "HbA1c", date: "2026-10-15", status: "completed", value: "7.8", unit: "%", reference: "4.6-6.2", flag: "high" },
      { id: "t-002", name: "空腹時血糖", date: "2026-10-15", status: "completed", value: "156", unit: "mg/dL", reference: "70-109", flag: "high" },
    ],
    riskLevel: "high",
    onlineEligible: true,
    monitoringDevices: ["血圧計", "血糖測定器", "体重計"],
  },
  {
    id: "p-002",
    name: "木村 花",
    age: 45,
    gender: "女性",
    conditions: ["高血圧", "脂質異常症"],
    lastVisit: "2026-10-20",
    nextVisit: "2026-11-20",
    phone: "090-2345-6789",
    vitals: { bp: "135/85", hr: 72, weight: 62.3, spo2: 98 },
    medications: [
      { name: "オルメサルタン", dosage: "20mg", frequency: "1日1回", startDate: "2026-01-10" },
      { name: "ロスバスタチン", dosage: "2.5mg", frequency: "1日1回", startDate: "2026-04-01" },
    ],
    testResults: [
      { id: "t-003", name: "LDLコレステロール", date: "2026-10-20", status: "completed", value: "142", unit: "mg/dL", reference: "<140", flag: "high" },
    ],
    riskLevel: "medium",
    onlineEligible: true,
    monitoringDevices: ["血圧計"],
  },
  {
    id: "p-003",
    name: "清水 太郎",
    age: 55,
    gender: "男性",
    conditions: ["2型糖尿病"],
    lastVisit: "2026-10-10",
    nextVisit: "2026-11-10",
    phone: "090-3456-7890",
    vitals: { bp: "128/80", hr: 68, glucose: 142, weight: 72.1, spo2: 98 },
    medications: [
      { name: "エンパグリフロジン", dosage: "10mg", frequency: "1日1回", startDate: "2026-02-15" },
    ],
    testResults: [
      { id: "t-004", name: "HbA1c", date: "2026-10-10", status: "completed", value: "6.9", unit: "%", reference: "4.6-6.2", flag: "high" },
    ],
    riskLevel: "medium",
    onlineEligible: true,
    monitoringDevices: ["血糖測定器", "体重計"],
  },
  {
    id: "p-004",
    name: "小川 敏子",
    age: 70,
    gender: "女性",
    conditions: ["高血圧", "心房細動"],
    lastVisit: "2026-10-25",
    nextVisit: "2026-11-08",
    phone: "090-4567-8901",
    vitals: { bp: "162/98", hr: 88, weight: 56.8, spo2: 96 },
    medications: [
      { name: "カンデサルタン", dosage: "8mg", frequency: "1日1回", startDate: "2024-08-01" },
      { name: "エドキサバン", dosage: "30mg", frequency: "1日1回", startDate: "2025-01-10" },
      { name: "ビソプロロール", dosage: "2.5mg", frequency: "1日1回", startDate: "2025-01-10" },
    ],
    testResults: [
      { id: "t-005", name: "BNP", date: "2026-10-25", status: "completed", value: "185", unit: "pg/mL", reference: "<18.4", flag: "critical" },
      { id: "t-006", name: "PT-INR", date: "2026-10-25", status: "completed", value: "2.1", unit: "", reference: "2.0-3.0", flag: "normal" },
    ],
    riskLevel: "high",
    onlineEligible: false,
    monitoringDevices: ["血圧計", "心電図モニター"],
  },
  {
    id: "p-005",
    name: "藤田 勇",
    age: 48,
    gender: "男性",
    conditions: ["脂質異常症", "脂肪肝"],
    lastVisit: "2026-10-18",
    nextVisit: "2026-12-18",
    phone: "090-5678-9012",
    vitals: { bp: "122/76", hr: 70, weight: 85.2, spo2: 98 },
    medications: [
      { name: "アトルバスタチン", dosage: "10mg", frequency: "1日1回", startDate: "2026-05-01" },
    ],
    testResults: [
      { id: "t-007", name: "AST", date: "2026-10-18", status: "completed", value: "45", unit: "U/L", reference: "10-40", flag: "high" },
      { id: "t-008", name: "ALT", date: "2026-10-18", status: "completed", value: "68", unit: "U/L", reference: "5-45", flag: "high" },
    ],
    riskLevel: "low",
    onlineEligible: true,
    monitoringDevices: ["体重計"],
  },
  {
    id: "p-006",
    name: "渡辺 美咲",
    age: 38,
    gender: "女性",
    conditions: ["甲状腺機能低下症"],
    lastVisit: "2026-09-20",
    nextVisit: "2026-11-20",
    phone: "090-6789-0123",
    vitals: { bp: "118/72", hr: 62, weight: 58.4, spo2: 99 },
    medications: [
      { name: "レボチロキシン", dosage: "50μg", frequency: "1日1回", startDate: "2025-11-01" },
    ],
    testResults: [
      { id: "t-009", name: "TSH", date: "2026-09-20", status: "completed", value: "3.2", unit: "μU/mL", reference: "0.5-5.0", flag: "normal" },
    ],
    riskLevel: "low",
    onlineEligible: true,
    monitoringDevices: [],
  },
  {
    id: "p-007",
    name: "山口 健二",
    age: 58,
    gender: "男性",
    conditions: ["2型糖尿病", "高血圧", "CKD G3a"],
    lastVisit: "2026-10-28",
    nextVisit: "2026-11-11",
    phone: "090-7890-1234",
    vitals: { bp: "155/95", hr: 82, glucose: 210, weight: 80.3, spo2: 96 },
    medications: [
      { name: "メトホルミン", dosage: "250mg", frequency: "1日2回", startDate: "2024-06-01" },
      { name: "テネリグリプチン", dosage: "20mg", frequency: "1日1回", startDate: "2025-09-01" },
      { name: "アジルサルタン", dosage: "20mg", frequency: "1日1回", startDate: "2024-06-01" },
    ],
    testResults: [
      { id: "t-010", name: "eGFR", date: "2026-10-28", status: "completed", value: "52", unit: "mL/min", reference: ">60", flag: "low" },
      { id: "t-011", name: "HbA1c", date: "2026-10-28", status: "completed", value: "8.2", unit: "%", reference: "4.6-6.2", flag: "critical" },
    ],
    riskLevel: "high",
    onlineEligible: true,
    monitoringDevices: ["血圧計", "血糖測定器", "体重計"],
  },
  {
    id: "p-008",
    name: "高橋 由美",
    age: 42,
    gender: "女性",
    conditions: ["片頭痛", "不安障害"],
    lastVisit: "2026-10-22",
    phone: "090-8901-2345",
    vitals: { bp: "115/70", hr: 74, weight: 54.2, spo2: 99 },
    medications: [
      { name: "スマトリプタン", dosage: "50mg", frequency: "頭痛時", startDate: "2026-03-01" },
    ],
    testResults: [],
    riskLevel: "low",
    onlineEligible: true,
    monitoringDevices: [],
  },
];

export const todayAppointments: Appointment[] = [
  { id: "a-001", patientId: "p-001", patientName: "佐々木 正雄", date: "2026-11-05", time: "09:00", type: "follow-up", status: "completed", reason: "糖尿病定期検診", doctor: "田中 一郎", duration: 15 },
  { id: "a-002", patientId: "p-004", patientName: "小川 敏子", date: "2026-11-05", time: "09:30", type: "follow-up", status: "completed", reason: "高血圧・心房細動フォロー", doctor: "田中 一郎", duration: 20 },
  { id: "a-003", patientId: "p-002", patientName: "木村 花", date: "2026-11-05", time: "10:00", type: "online", status: "in-progress", reason: "高血圧再診", doctor: "田中 一郎", duration: 10 },
  { id: "a-004", patientId: "p-007", patientName: "山口 健二", date: "2026-11-05", time: "10:30", type: "follow-up", status: "waiting", reason: "糖尿病・腎機能フォロー", doctor: "田中 一郎", duration: 20 },
  { id: "a-005", patientId: "p-003", patientName: "清水 太郎", date: "2026-11-05", time: "11:00", type: "online", status: "scheduled", reason: "糖尿病再診", doctor: "田中 一郎", duration: 10 },
  { id: "a-006", patientId: "p-005", patientName: "藤田 勇", date: "2026-11-05", time: "11:30", type: "online", status: "scheduled", reason: "脂質異常症再診", doctor: "田中 一郎", duration: 10 },
  { id: "a-007", patientId: "p-006", patientName: "渡辺 美咲", date: "2026-11-05", time: "14:00", type: "online", status: "scheduled", reason: "甲状腺機能フォロー", doctor: "田中 一郎", duration: 10 },
  { id: "a-008", patientId: "p-008", patientName: "高橋 由美", date: "2026-11-05", time: "14:30", type: "initial", status: "scheduled", reason: "頭痛精査", doctor: "田中 一郎", duration: 30 },
];

export const triageSessions: TriageSession[] = [
  {
    id: "ts-001",
    patientId: "p-007",
    patientName: "山口 健二",
    age: 58,
    gender: "男性",
    startedAt: "2026-11-05T10:15:00",
    status: "completed",
    chiefComplaint: "口渇・多飲・倦怠感の悪化",
    riskScore: 82,
    riskLevel: "high",
    suggestedTests: ["HbA1c", "随時血糖", "尿アルブミン", "eGFR", "電解質"],
    suggestedDiagnosis: ["2型糖尿病コントロール不良", "糖尿病性腎症進行の可能性"],
    karteeDraft: "【S】口渇・多飲・倦怠感が2週間前より増悪。夜間頻尿3回/夜。体重2kg減少。\n【O】BP 155/95, HR 82, BS 210mg/dL。前回HbA1c 8.2%。eGFR 52→低下傾向。\n【A】2型糖尿病コントロール不良。CKD G3a進行の懸念。\n【P】HbA1c・随時血糖・尿アルブミン・eGFR再検。薬剤調整検討。腎臓内科コンサルト要否判断。",
    triageQuestions: [
      { q: "最も気になる症状は何ですか？", a: "口が渇いて水をたくさん飲んでしまう。体がだるい。" },
      { q: "いつ頃から症状がありますか？", a: "2週間くらい前から悪くなった" },
      { q: "食事は普段通りですか？", a: "食欲は普通だが、体重が2kg減った" },
      { q: "夜中にトイレに起きますか？", a: "はい、3回くらい" },
      { q: "血糖値の自己測定はしていますか？", a: "はい、朝食前で180-220くらい" },
      { q: "足のしびれや視力の変化はありますか？", a: "少し足先がしびれる感じがある" },
    ],
  },
  {
    id: "ts-002",
    patientId: "p-008",
    patientName: "高橋 由美",
    age: 42,
    gender: "女性",
    startedAt: "2026-11-05T14:10:00",
    status: "reviewing",
    chiefComplaint: "頻回な頭痛・吐き気",
    riskScore: 45,
    riskLevel: "medium",
    suggestedTests: ["頭部MRI", "血液検査（CBC, CRP, ESR）"],
    suggestedDiagnosis: ["片頭痛増悪", "緊張型頭痛合併の可能性"],
    karteeDraft: "【S】月に10回以上の頭痛。拍動性、片側性。嘔気伴う。光・音過敏あり。スマトリプタン効果減弱。\n【O】BP 115/70, HR 74。神経学的異常所見なし。\n【A】片頭痛の頻度増加。慢性片頭痛への移行の可能性。\n【P】頭部MRI（器質的疾患除外）。予防薬導入検討（バルプロ酸 or プロプラノロール）。頭痛ダイアリー指導。",
    triageQuestions: [
      { q: "頭痛はどのような痛みですか？", a: "ズキズキと脈打つような痛み、主に右側" },
      { q: "頻度はどのくらいですか？", a: "最近は月に10回以上、ほぼ毎日のことも" },
      { q: "吐き気や嘔吐はありますか？", a: "吐き気はほぼ毎回。嘔吐はたまに" },
      { q: "光や音に敏感になりますか？", a: "はい、頭痛のときは暗い部屋にいたい" },
      { q: "頭痛薬の効き目はどうですか？", a: "スマトリプタンが前より効かなくなった気がする" },
    ],
  },
];

export const vitalAlerts: VitalAlert[] = [
  { id: "va-001", patientId: "p-001", patientName: "佐々木 正雄", type: "glucose", value: "245 mg/dL", threshold: "180 mg/dL", severity: "critical", timestamp: "2026-11-05T08:30:00", acknowledged: false },
  { id: "va-002", patientId: "p-004", patientName: "小川 敏子", type: "blood_pressure", value: "178/105 mmHg", threshold: "140/90 mmHg", severity: "critical", timestamp: "2026-11-05T07:45:00", acknowledged: false },
  { id: "va-003", patientId: "p-007", patientName: "山口 健二", type: "blood_pressure", value: "165/100 mmHg", threshold: "140/90 mmHg", severity: "warning", timestamp: "2026-11-05T08:00:00", acknowledged: true },
  { id: "va-004", patientId: "p-007", patientName: "山口 健二", type: "glucose", value: "228 mg/dL", threshold: "180 mg/dL", severity: "warning", timestamp: "2026-11-05T07:30:00", acknowledged: true },
  { id: "va-005", patientId: "p-002", patientName: "木村 花", type: "blood_pressure", value: "148/92 mmHg", threshold: "140/90 mmHg", severity: "warning", timestamp: "2026-11-05T06:30:00", acknowledged: true },
  { id: "va-006", patientId: "p-001", patientName: "佐々木 正雄", type: "weight", value: "+1.8kg/週", threshold: "+1.5kg/週", severity: "warning", timestamp: "2026-11-05T06:00:00", acknowledged: false },
];

export const prescriptions: Prescription[] = [
  {
    id: "rx-001",
    patientId: "p-001",
    patientName: "佐々木 正雄",
    date: "2026-11-05",
    medications: [
      { name: "メトホルミン", dosage: "500mg 1日2回 毎食後", days: 30, instructions: "食後に服用" },
      { name: "アムロジピン", dosage: "5mg 1日1回 朝食後", days: 30, instructions: "朝食後に服用" },
    ],
    status: "sent",
    pharmacy: "ウエルシア薬局 渋谷店",
    doctor: "田中 一郎",
  },
  {
    id: "rx-002",
    patientId: "p-002",
    patientName: "木村 花",
    date: "2026-11-05",
    medications: [
      { name: "オルメサルタン", dosage: "20mg 1日1回 朝食後", days: 30, instructions: "朝食後に服用" },
      { name: "ロスバスタチン", dosage: "2.5mg 1日1回 夕食後", days: 30, instructions: "夕食後に服用" },
    ],
    status: "draft",
    doctor: "田中 一郎",
  },
];

export const labOrders: LabOrder[] = [
  {
    id: "lo-001",
    patientId: "p-007",
    patientName: "山口 健二",
    orderedAt: "2026-11-05T10:45:00",
    lab: "SRLラボラトリーズ",
    tests: ["HbA1c", "随時血糖", "尿アルブミン/Cr比", "eGFR", "Na/K/Cl"],
    status: "ordered",
    estimatedCompletion: "2026-11-06T15:00:00",
  },
  {
    id: "lo-002",
    patientId: "p-001",
    patientName: "佐々木 正雄",
    orderedAt: "2026-10-30T09:30:00",
    lab: "BMLクリニカル",
    tests: ["HbA1c", "空腹時血糖", "Cr", "eGFR", "脂質パネル"],
    status: "completed",
    results: [
      { test: "HbA1c", value: "7.8", unit: "%", flag: "H" },
      { test: "空腹時血糖", value: "156", unit: "mg/dL", flag: "H" },
      { test: "Cr", value: "0.92", unit: "mg/dL", flag: "N" },
      { test: "eGFR", value: "68", unit: "mL/min", flag: "N" },
      { test: "LDL-C", value: "128", unit: "mg/dL", flag: "N" },
    ],
  },
  {
    id: "lo-003",
    patientId: "p-008",
    patientName: "高橋 由美",
    orderedAt: "2026-11-05T14:45:00",
    lab: "SRLラボラトリーズ",
    tests: ["CBC", "CRP", "ESR", "頭部MRI"],
    status: "ordered",
    estimatedCompletion: "2026-11-07T12:00:00",
  },
];

export const vitalTypeLabel: Record<string, string> = {
  blood_pressure: "血圧",
  heart_rate: "心拍数",
  glucose: "血糖値",
  weight: "体重",
  spo2: "SpO2",
};

export const vitalHistory = [
  { date: "10/29", bp_sys: 142, bp_dia: 88, glucose: 178, hr: 76, weight: 78.0 },
  { date: "10/30", bp_sys: 138, bp_dia: 86, glucose: 165, hr: 74, weight: 78.1 },
  { date: "10/31", bp_sys: 145, bp_dia: 90, glucose: 192, hr: 80, weight: 78.3 },
  { date: "11/01", bp_sys: 150, bp_dia: 94, glucose: 205, hr: 82, weight: 78.5 },
  { date: "11/02", bp_sys: 148, bp_dia: 92, glucose: 198, hr: 78, weight: 78.8 },
  { date: "11/03", bp_sys: 152, bp_dia: 96, glucose: 218, hr: 84, weight: 79.0 },
  { date: "11/04", bp_sys: 155, bp_dia: 98, glucose: 232, hr: 80, weight: 79.2 },
  { date: "11/05", bp_sys: 148, bp_dia: 92, glucose: 245, hr: 78, weight: 79.5 },
];
