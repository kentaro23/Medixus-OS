-- ============================================================
-- 006: health_checkups, vital_records, vital_alerts, risk_scores
-- ============================================================

CREATE TABLE health_checkups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  checkup_date DATE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('upload', 'ocr', 'api', 'manual')),
  raw_file_url TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  ai_risk_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE vital_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('healthkit', 'google_fit', 'bluetooth', 'manual')),
  vital_type TEXT NOT NULL CHECK (vital_type IN (
    'blood_pressure_systolic', 'blood_pressure_diastolic',
    'heart_rate', 'blood_glucose', 'body_weight', 'body_temperature',
    'spo2', 'steps', 'sleep_hours'
  )),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  is_abnormal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_vital_records_patient ON vital_records(patient_id, recorded_at);
CREATE INDEX idx_vital_records_type ON vital_records(vital_type, recorded_at);

CREATE TABLE vital_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  vital_record_id UUID REFERENCES vital_records(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('high', 'low', 'trend_worsening')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  online_consultation_suggested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  score_type TEXT NOT NULL CHECK (score_type IN (
    'hypertension', 'diabetes', 'dyslipidemia', 'ckd', 'cardiovascular'
  )),
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  factors JSONB DEFAULT '{}',
  ai_explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_risk_scores_patient ON risk_scores(patient_id, score_type);
