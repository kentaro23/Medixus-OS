-- ============================================================
-- 020: 対面事務効率化SaaS v2 テーブル
-- AI電話受付 / LINE連携 / 順番管理 / Web問診 / サイネージ
-- ============================================================

-- AI電話受付ログ
CREATE TABLE phone_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  caller_phone TEXT,
  patient_id UUID REFERENCES patients(id),
  call_type TEXT NOT NULL CHECK (call_type IN ('incoming', 'outgoing')),
  handler TEXT NOT NULL CHECK (handler IN ('ai', 'staff', 'voicemail')),
  purpose TEXT CHECK (purpose IN ('appointment', 'change', 'cancel', 'inquiry', 'emergency', 'other')),
  transcript TEXT,
  ai_summary TEXT,
  duration_seconds INTEGER,
  transferred_to_staff BOOLEAN NOT NULL DEFAULT false,
  recording_url TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_phone_calls_clinic ON phone_call_logs(clinic_id, started_at);
CREATE INDEX idx_phone_calls_patient ON phone_call_logs(patient_id);

-- LINE連携
CREATE TABLE line_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  line_user_id TEXT NOT NULL,
  display_name TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(patient_id, clinic_id)
);

CREATE INDEX idx_line_connections_line ON line_connections(line_user_id);

-- 順番管理
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  queue_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'called', 'in_consultation', 'completed', 'no_show')) DEFAULT 'waiting',
  checked_in_at TIMESTAMPTZ,
  called_at TIMESTAMPTZ,
  away_mode BOOLEAN NOT NULL DEFAULT false,
  away_notify_at_remaining INTEGER,
  estimated_wait_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_queue_clinic_status ON queue_entries(clinic_id, status);

-- Web問診テンプレート
CREATE TABLE web_questionnaire_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  template_key TEXT NOT NULL,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

-- Web問診回答
CREATE TABLE web_questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_id UUID REFERENCES appointments(id),
  template_id UUID REFERENCES web_questionnaire_templates(id),
  responses JSONB NOT NULL DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  ai_summary TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_questionnaire_resp_patient ON web_questionnaire_responses(patient_id);

-- サイネージコンテンツ
CREATE TABLE signage_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('announcement', 'health_info', 'promotion')),
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_signage_clinic ON signage_contents(clinic_id, is_active);

-- RLS
ALTER TABLE phone_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE signage_contents ENABLE ROW LEVEL SECURITY;

-- phone_call_logs: スタッフのみ
CREATE POLICY "pcl_select_staff" ON phone_call_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = phone_call_logs.clinic_id AND is_active = true
  ));
CREATE POLICY "pcl_select_admin" ON phone_call_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'medixus_admin'));

-- line_connections: 患者本人 + スタッフ
CREATE POLICY "lc_select_own" ON line_connections
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "lc_select_staff" ON line_connections
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = line_connections.clinic_id AND is_active = true
  ));

-- queue_entries: 認証済みユーザー（クリニック別）
CREATE POLICY "qe_select_clinic" ON queue_entries
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = queue_entries.clinic_id AND is_active = true
  ));
CREATE POLICY "qe_select_own" ON queue_entries
  FOR SELECT USING (patient_id = auth.uid());

-- questionnaire templates: 認証済みなら閲覧可
CREATE POLICY "qt_select_auth" ON web_questionnaire_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "qt_manage_staff" ON web_questionnaire_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = web_questionnaire_templates.clinic_id
      AND staff_role IN ('admin', 'managing_doctor') AND is_active = true
  ));

-- questionnaire responses: 患者本人 + スタッフ
CREATE POLICY "qr_select_own" ON web_questionnaire_responses
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "qr_select_staff" ON web_questionnaire_responses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = web_questionnaire_responses.clinic_id AND is_active = true
  ));
CREATE POLICY "qr_insert_patient" ON web_questionnaire_responses
  FOR INSERT WITH CHECK (patient_id = auth.uid() OR patient_id IS NULL);

-- signage: 誰でも閲覧可（待合室表示用）
CREATE POLICY "sc_select_public" ON signage_contents
  FOR SELECT USING (true);
CREATE POLICY "sc_manage_staff" ON signage_contents
  FOR ALL USING (EXISTS (
    SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = signage_contents.clinic_id
      AND staff_role IN ('admin', 'managing_doctor') AND is_active = true
  ));

-- updated_at トリガー
CREATE TRIGGER set_updated_at BEFORE UPDATE ON web_questionnaire_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON signage_contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
