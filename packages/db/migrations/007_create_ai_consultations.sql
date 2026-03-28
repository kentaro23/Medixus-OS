-- ============================================================
-- 007: ai_consultations テーブル
-- ============================================================

CREATE TABLE ai_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  clinic_id UUID REFERENCES clinics(id),
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'cancelled')) DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  messages JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  triage_level TEXT CHECK (triage_level IN ('emergency', 'semi_urgent', 'routine', 'observation')),
  recommended_tests JSONB DEFAULT '[]',
  suggested_prescriptions JSONB DEFAULT '[]',
  needs_in_person BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_ai_consultations_patient ON ai_consultations(patient_id);
CREATE INDEX idx_ai_consultations_status ON ai_consultations(status);
