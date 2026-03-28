-- ============================================================
-- 016: medication_logs (服薬管理)
-- ============================================================

CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  prescription_item_id UUID NOT NULL REFERENCES prescription_items(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'skipped', 'side_effect')),
  side_effect_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_medication_logs_patient ON medication_logs(patient_id, scheduled_at);
CREATE INDEX idx_medication_logs_status ON medication_logs(status);
