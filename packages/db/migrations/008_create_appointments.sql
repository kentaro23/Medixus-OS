-- ============================================================
-- 008: appointments, video_sessions, consents
-- ============================================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_type TEXT NOT NULL CHECK (appointment_type IN (
    'online_initial', 'online_followup', 'in_person_initial', 'in_person_followup',
    'pre_consultation', 'self_pay'
  )),
  status TEXT NOT NULL CHECK (status IN (
    'scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show'
  )) DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  ai_consultation_id UUID REFERENCES ai_consultations(id),
  cancel_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, scheduled_at);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_status ON appointments(status, scheduled_at);

CREATE TABLE video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('twilio', 'agora')),
  room_id TEXT NOT NULL,
  patient_joined_at TIMESTAMPTZ,
  doctor_joined_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  recording_url TEXT,
  recording_consent BOOLEAN NOT NULL DEFAULT false,
  quality_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'online_diagnosis', 'recording', 'data_sharing', 'treatment_plan', 'privacy_policy'
  )),
  version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  signature_data TEXT,
  pdf_url TEXT,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_consents_patient ON consents(patient_id);
