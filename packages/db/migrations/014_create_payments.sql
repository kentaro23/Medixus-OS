-- ============================================================
-- 014: payments (決済)
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_id UUID REFERENCES appointments(id),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('insurance_copay', 'self_pay', 'subscription')),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JPY',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_clinic ON payments(clinic_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);
