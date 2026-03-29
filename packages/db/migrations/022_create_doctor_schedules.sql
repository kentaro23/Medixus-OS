-- 医師スケジュール管理
CREATE TABLE doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX idx_doctor_schedules_clinic ON doctor_schedules(clinic_id);

ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor_schedules_select_own" ON doctor_schedules
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "doctor_schedules_select_clinic_staff" ON doctor_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_staff cs
      WHERE cs.profile_id = auth.uid()
        AND cs.clinic_id = doctor_schedules.clinic_id
        AND cs.is_active = true
    )
  );

CREATE POLICY "doctor_schedules_select_patient" ON doctor_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'patient'
    )
  );

CREATE POLICY "doctor_schedules_insert_own" ON doctor_schedules
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "doctor_schedules_update_own" ON doctor_schedules
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "doctor_schedules_admin" ON doctor_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'medixus_admin')
  );

CREATE TRIGGER set_updated_at_doctor_schedules
  BEFORE UPDATE ON doctor_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
