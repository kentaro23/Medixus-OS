-- ============================================================
-- 017: audit_logs (監査ログ)
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  action TEXT NOT NULL CHECK (action IN (
    'create', 'read', 'update', 'delete',
    'login', 'logout', 'export', 'print',
    'prescribe', 'approve', 'reject',
    'access_patient_data', 'access_medical_record'
  )),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  clinic_id UUID REFERENCES clinics(id),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_clinic ON audit_logs(clinic_id);
