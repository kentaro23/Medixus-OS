-- Medixus OS: Initial Schema
-- Run this migration in Supabase SQL Editor

-- ============================================================
-- ENUM types
-- ============================================================

CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'nurse', 'staff', 'clinic_admin', 'admin');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE clinic_type AS ENUM ('partner', 'owned');
CREATE TYPE clinic_status AS ENUM ('active', 'trial', 'onboarding', 'churned');
CREATE TYPE appointment_type AS ENUM ('initial', 'follow_up', 'online', 'pre_consultation', 'monitoring_review');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE triage_urgency AS ENUM ('emergency', 'semi_urgent', 'normal', 'observation');
CREATE TYPE prescription_status AS ENUM ('draft', 'signed', 'sent', 'dispensed', 'cancelled');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- ============================================================
-- 1. profiles — extends Supabase auth.users
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  first_name_kana TEXT,
  last_name_kana TEXT,
  date_of_birth DATE,
  gender gender_type,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address_line TEXT,
  avatar_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. clinics
-- ============================================================

CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type clinic_type NOT NULL DEFAULT 'partner',
  status clinic_status NOT NULL DEFAULT 'onboarding',
  specialty TEXT[],
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address_line TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  business_hours JSONB,
  subscribed_products TEXT[] NOT NULL DEFAULT '{}',
  subscription_plan TEXT NOT NULL DEFAULT 'individual',
  mrr INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. doctors
-- ============================================================

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  license_number TEXT NOT NULL,
  specialties TEXT[],
  qualifications TEXT[],
  bio TEXT,
  consultation_fee_online INTEGER,
  consultation_fee_inperson INTEGER,
  max_daily_patients INTEGER DEFAULT 40,
  is_accepting_new_patients BOOLEAN NOT NULL DEFAULT TRUE,
  schedule JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(license_number)
);

-- ============================================================
-- 4. staff (clinic ↔ user join table)
-- ============================================================

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, clinic_id)
);

-- ============================================================
-- 5. patient_insurance — 保険証情報
-- ============================================================

CREATE TABLE patient_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insurer_number TEXT,
  insurer_name TEXT,
  symbol TEXT,
  number TEXT,
  branch_number TEXT,
  holder_relation TEXT,
  valid_from DATE,
  valid_until DATE,
  front_image_url TEXT,
  back_image_url TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. patient_medical_history — 既往歴・アレルギー
-- ============================================================

CREATE TABLE patient_medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  allergies JSONB DEFAULT '[]',
  past_illnesses JSONB DEFAULT '[]',
  family_history JSONB DEFAULT '[]',
  current_medications JSONB DEFAULT '[]',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 7. audit_logs
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_doctors_clinic ON doctors(clinic_id);
CREATE INDEX idx_doctors_user ON doctors(user_id);
CREATE INDEX idx_staff_clinic ON staff(clinic_id);
CREATE INDEX idx_staff_user ON staff(user_id);
CREATE INDEX idx_patient_insurance_user ON patient_insurance(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- Row-Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- profiles: admins can view all
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- clinics: authenticated users can view
CREATE POLICY "Authenticated can view clinics"
  ON clinics FOR SELECT TO authenticated USING (TRUE);

-- doctors: authenticated users can view
CREATE POLICY "Authenticated can view doctors"
  ON doctors FOR SELECT TO authenticated USING (TRUE);

-- patient_insurance: users can manage their own
CREATE POLICY "Users manage own insurance"
  ON patient_insurance FOR ALL USING (auth.uid() = user_id);

-- patient_medical_history: users can manage their own
CREATE POLICY "Users manage own medical history"
  ON patient_medical_history FOR ALL USING (auth.uid() = user_id);

-- staff: clinic members can view their own clinic staff
CREATE POLICY "Staff can view own clinic"
  ON staff FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM staff s WHERE s.user_id = auth.uid() AND s.clinic_id = clinic_id)
  );

-- audit_logs: admins only
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'patient'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Trigger: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_patient_insurance_updated_at
  BEFORE UPDATE ON patient_insurance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_patient_medical_history_updated_at
  BEFORE UPDATE ON patient_medical_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
