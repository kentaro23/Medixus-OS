-- ============================================================
-- 019: updated_at 自動更新トリガー + 監査ログトリガー
-- ============================================================

-- ======================== updated_at トリガー関数 ========================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at カラムを持つ全テーブルにトリガー適用
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'clinics', 'patients', 'doctors',
      'health_checkups', 'ai_consultations', 'appointments',
      'medical_records', 'diagnoses', 'prescriptions',
      'partner_pharmacies', 'partner_labs', 'lab_orders',
      'insurance_claims', 'payments'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;

-- ======================== 監査ログ自動記録トリガー ========================

CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_old JSONB;
  v_new JSONB;
  v_actor_role TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_old := NULL;
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_old := to_jsonb(OLD);
    v_new := NULL;
  END IF;

  SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();

  INSERT INTO audit_logs (actor_id, actor_role, action, resource_type, resource_id, old_values, new_values)
  VALUES (
    auth.uid(),
    v_actor_role,
    v_action,
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN (v_old->>'id')::UUID
      ELSE (v_new->>'id')::UUID
    END,
    v_old,
    v_new
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 監査対象テーブルにトリガー適用
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'patients', 'medical_records', 'prescriptions',
      'ai_consultations', 'vital_records', 'health_checkups'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION audit_log_trigger()',
      tbl, tbl
    );
  END LOOP;
END;
$$;
