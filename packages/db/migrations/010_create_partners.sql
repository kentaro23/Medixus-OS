-- ============================================================
-- 010: partner_pharmacies, partner_labs
-- 処方・検査オーダーのFK先なので先に作成
-- ============================================================

CREATE TABLE partner_pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  postal_code TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  supports_delivery BOOLEAN NOT NULL DEFAULT false,
  api_endpoint TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE partner_labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  postal_code TEXT,
  address TEXT,
  phone TEXT,
  available_tests JSONB DEFAULT '[]',
  api_endpoint TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);
