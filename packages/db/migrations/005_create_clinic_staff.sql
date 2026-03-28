-- ============================================================
-- 005: clinic_staff テーブル
-- ============================================================

CREATE TABLE clinic_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  staff_role TEXT NOT NULL CHECK (staff_role IN ('managing_doctor', 'doctor', 'nurse', 'clerk', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, profile_id)
);

CREATE INDEX idx_clinic_staff_clinic ON clinic_staff(clinic_id);
CREATE INDEX idx_clinic_staff_profile ON clinic_staff(profile_id);
