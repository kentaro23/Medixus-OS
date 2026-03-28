-- ============================================================
-- 011: prescriptions, prescription_items
-- ============================================================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  medical_record_id UUID REFERENCES medical_records(id),
  prescription_number TEXT UNIQUE,
  prescription_type TEXT NOT NULL CHECK (prescription_type IN ('insurance', 'self_pay')),
  status TEXT NOT NULL CHECK (status IN (
    'draft', 'ai_suggested', 'doctor_approved', 'sent_to_pharmacy',
    'dispensed', 'delivered', 'cancelled'
  )) DEFAULT 'draft',
  is_refill BOOLEAN NOT NULL DEFAULT false,
  prescribed_at TIMESTAMPTZ,
  pharmacy_id UUID REFERENCES partner_pharmacies(id),
  delivery_tracking_number TEXT,
  initial_visit_day_limit_check BOOLEAN DEFAULT true,
  contraindication_check BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id),
  medication_name TEXT NOT NULL,
  medication_code TEXT,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  quantity NUMERIC NOT NULL,
  is_generic_substitution_allowed BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  ai_suggested BOOLEAN NOT NULL DEFAULT false,
  ai_confidence NUMERIC,
  doctor_modified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_prescription_items_rx ON prescription_items(prescription_id);
