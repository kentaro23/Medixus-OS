-- ============================================================
-- 012: lab_orders
-- ============================================================

CREATE TABLE lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  lab_id UUID NOT NULL REFERENCES partner_labs(id),
  medical_record_id UUID REFERENCES medical_records(id),
  ordered_tests JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN (
    'ordered', 'sample_collected', 'processing', 'completed', 'cancelled'
  )) DEFAULT 'ordered',
  results JSONB,
  results_received_at TIMESTAMPTZ,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
