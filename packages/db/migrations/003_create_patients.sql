-- ============================================================
-- 003: patients テーブル + patient_clinic_registrations
-- ============================================================

CREATE TABLE patients (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  postal_code TEXT,
  address TEXT,
  -- 保険情報（アプリケーションレベルで暗号化）
  insurance_provider_number TEXT,
  insurance_symbol TEXT,
  insurance_number TEXT,
  insurance_expiry DATE,
  insurance_card_image_url TEXT,
  -- 医療情報
  allergies JSONB DEFAULT '[]',
  medical_history JSONB DEFAULT '[]',
  family_history JSONB DEFAULT '[]',
  current_medications JSONB DEFAULT '[]',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  -- 共通
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE patient_clinic_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(patient_id, clinic_id)
);

CREATE INDEX idx_pcr_patient ON patient_clinic_registrations(patient_id);
CREATE INDEX idx_pcr_clinic ON patient_clinic_registrations(clinic_id);
