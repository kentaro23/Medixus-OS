-- ============================================================
-- 013: insurance_claims (レセプト)
-- ============================================================

CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  claim_month TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'draft', 'submitted', 'accepted', 'rejected', 'appealed'
  )) DEFAULT 'draft',
  total_points INTEGER NOT NULL DEFAULT 0,
  patient_copay INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  response_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_claims_clinic_month ON insurance_claims(clinic_id, claim_month);
CREATE INDEX idx_claims_patient ON insurance_claims(patient_id);
