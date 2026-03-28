-- ============================================================
-- 001: profiles テーブル（Supabase Auth 拡張）
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'clerk', 'clinic_admin', 'medixus_admin')),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_profiles_role ON profiles(role);
