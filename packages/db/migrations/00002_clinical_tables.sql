-- Medixus OS: Clinical Tables (AI Triage, Appointments, Prescriptions, etc.)

-- ============================================================
-- Additional ENUM types
-- ============================================================

CREATE TYPE consultation_type AS ENUM ('online', 'in_person', 'pre_consultation');
CREATE TYPE consent_type AS ENUM ('online_consultation', 'recording', 'privacy', 'treatment_plan');
CREATE TYPE lab_order_status AS ENUM ('ordered', 'received', 'processing', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('appointment_reminder', 'test_result', 'vital_alert', 'message', 'prescription', 'system');

-- ============================================================
-- 8. vital_records — バイタルデータ
-- ============================================================

CREATE TABLE vital_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'manual',
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  heart_rate INTEGER,
  body_temperature NUMERIC(4,1),
  spo2 INTEGER,
  blood_glucose INTEGER,
  blood_glucose_timing TEXT,
  weight NUMERIC(5,1),
  height NUMERIC(5,1),
  steps INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. health_checkups — 健診データ
-- ============================================================

CREATE TABLE health_checkups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checkup_date DATE NOT NULL,
  facility_name TEXT,
  document_url TEXT,
  results JSONB NOT NULL DEFAULT '{}',
  ai_risk_score NUMERIC(5,2),
  ai_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. ai_consultations — AI問診セッション
-- ============================================================

CREATE TABLE ai_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  chief_complaint TEXT NOT NULL,
  conversation JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  triage_urgency triage_urgency,
  triage_reason TEXT,
  suggested_diagnoses JSONB DEFAULT '[]',
  suggested_tests JSONB DEFAULT '[]',
  recommended_action TEXT,
  vitals_snapshot JSONB,
  medical_history_snapshot JSONB,
  doctor_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  doctor_id UUID REFERENCES doctors(id),
  doctor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. risk_scores — リスクスコア
-- ============================================================

CREATE TABLE risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score_type TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  components JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. appointments — 予約
-- ============================================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  ai_consultation_id UUID REFERENCES ai_consultations(id),
  type appointment_type NOT NULL DEFAULT 'online',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  reason TEXT,
  notes TEXT,
  fee_amount INTEGER,
  is_first_visit BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 13. video_sessions — ビデオ通話
-- ============================================================

CREATE TABLE video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'twilio',
  room_id TEXT,
  room_token TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  recording_url TEXT,
  recording_consented BOOLEAN NOT NULL DEFAULT FALSE,
  quality_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 14. consents — 同意記録
-- ============================================================

CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  type consent_type NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  content_hash TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  signature_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 15. medical_records — 電子カルテ
-- ============================================================

CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_id UUID REFERENCES appointments(id),
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  ai_suggestion_assessment TEXT,
  ai_suggestion_plan TEXT,
  ai_suggestion_accepted BOOLEAN,
  attachments JSONB DEFAULT '[]',
  template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 16. diagnoses — 傷病名
-- ============================================================

CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  icd10_code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  onset_date DATE,
  resolved_date DATE,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 17. prescriptions — 処方箋
-- ============================================================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_id UUID REFERENCES appointments(id),
  medical_record_id UUID REFERENCES medical_records(id),
  status prescription_status NOT NULL DEFAULT 'draft',
  prescription_number TEXT,
  is_refill BOOLEAN NOT NULL DEFAULT FALSE,
  refill_count INTEGER DEFAULT 0,
  max_refills INTEGER DEFAULT 0,
  prescribed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  dispensed_at TIMESTAMPTZ,
  pharmacy_id UUID,
  delivery_tracking TEXT,
  notes TEXT,
  is_first_visit_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  max_days_supply INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 18. prescription_items — 処方明細
-- ============================================================

CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  unit TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT NOT NULL DEFAULT '経口',
  days_supply INTEGER NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  no_generic_substitution BOOLEAN NOT NULL DEFAULT FALSE,
  is_controlled_substance BOOLEAN NOT NULL DEFAULT FALSE,
  instructions TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 19. partner_pharmacies — 提携薬局
-- ============================================================

CREATE TABLE partner_pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  postal_code TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  supports_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 20. partner_labs — 提携検査機関
-- ============================================================

CREATE TABLE partner_labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  available_tests JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 21. lab_orders — 検査オーダー
-- ============================================================

CREATE TABLE lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  lab_id UUID NOT NULL REFERENCES partner_labs(id),
  appointment_id UUID REFERENCES appointments(id),
  status lab_order_status NOT NULL DEFAULT 'ordered',
  tests JSONB NOT NULL DEFAULT '[]',
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  results JSONB,
  ai_interpretation TEXT,
  abnormal_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 22. medication_logs — 服薬ログ
-- ============================================================

CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prescription_item_id UUID REFERENCES prescription_items(id),
  medication_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  side_effects TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 23. messages — メッセージ
-- ============================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 24. notifications — 通知
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_vital_records_user ON vital_records(user_id, recorded_at DESC);
CREATE INDEX idx_health_checkups_user ON health_checkups(user_id);
CREATE INDEX idx_ai_consultations_user ON ai_consultations(user_id);
CREATE INDEX idx_ai_consultations_doctor ON ai_consultations(doctor_id);
CREATE INDEX idx_appointments_user ON appointments(user_id, scheduled_at);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, scheduled_at);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id, scheduled_at);
CREATE INDEX idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_lab_orders_user ON lab_orders(user_id);
CREATE INDEX idx_medication_logs_user ON medication_logs(user_id, scheduled_at);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_risk_scores_user ON risk_scores(user_id, calculated_at DESC);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checkups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Patients can see their own records
CREATE POLICY "Users manage own vitals" ON vital_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own checkups" ON health_checkups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own consultations" ON ai_consultations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own risk scores" ON risk_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own consents" ON consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own prescriptions" ON prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own med logs" ON medication_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users view own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Doctors can access patients of their clinic
CREATE POLICY "Doctors view consultations" ON ai_consultations FOR SELECT USING (
  EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = auth.uid() AND d.id = doctor_id)
);
CREATE POLICY "Doctors manage appointments" ON appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = auth.uid() AND d.id = doctor_id)
);
CREATE POLICY "Doctors manage records" ON medical_records FOR ALL USING (
  EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = auth.uid() AND d.id = doctor_id)
);
CREATE POLICY "Doctors manage prescriptions" ON prescriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = auth.uid() AND d.id = doctor_id)
);

-- updated_at triggers
CREATE TRIGGER set_health_checkups_updated_at BEFORE UPDATE ON health_checkups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_ai_consultations_updated_at BEFORE UPDATE ON ai_consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_lab_orders_updated_at BEFORE UPDATE ON lab_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
