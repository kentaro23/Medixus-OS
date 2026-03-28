-- ============================================================
-- 018: Row Level Security ポリシー
--
-- 原則:
--   患者 → 自分のデータのみ
--   スタッフ → 自クリニックの患者データのみ
--   medixus_admin → 全データ（監査ログ付き）
-- ============================================================

-- ======================== ヘルパー関数 ========================

CREATE OR REPLACE FUNCTION is_medixus_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'medixus_admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_clinic_staff_for(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM clinic_staff
    WHERE profile_id = auth.uid() AND clinic_id = p_clinic_id AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION patient_in_my_clinic(p_patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM clinic_staff cs
    JOIN patient_clinic_registrations pcr ON pcr.clinic_id = cs.clinic_id
    WHERE cs.profile_id = auth.uid()
      AND cs.is_active = true
      AND pcr.patient_id = p_patient_id
      AND pcr.is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ======================== profiles ========================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "profiles_select_clinic_staff" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_staff cs1
      JOIN clinic_staff cs2 ON cs1.clinic_id = cs2.clinic_id
      WHERE cs1.profile_id = auth.uid() AND cs2.profile_id = profiles.id
        AND cs1.is_active = true AND cs2.is_active = true
    )
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_medixus_admin());


-- ======================== clinics ========================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinics_select_staff" ON clinics
  FOR SELECT USING (is_clinic_staff_for(id));

CREATE POLICY "clinics_select_admin" ON clinics
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "clinics_update_admin" ON clinics
  FOR UPDATE USING (is_medixus_admin());

CREATE POLICY "clinics_insert_admin" ON clinics
  FOR INSERT WITH CHECK (is_medixus_admin());


-- ======================== patients ========================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_select_own" ON patients
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "patients_update_own" ON patients
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "patients_select_clinic_staff" ON patients
  FOR SELECT USING (patient_in_my_clinic(id));

CREATE POLICY "patients_select_admin" ON patients
  FOR SELECT USING (is_medixus_admin());


-- ======================== patient_clinic_registrations ========================

ALTER TABLE patient_clinic_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pcr_select_patient" ON patient_clinic_registrations
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "pcr_select_staff" ON patient_clinic_registrations
  FOR SELECT USING (is_clinic_staff_for(clinic_id));

CREATE POLICY "pcr_select_admin" ON patient_clinic_registrations
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "pcr_insert_staff" ON patient_clinic_registrations
  FOR INSERT WITH CHECK (is_clinic_staff_for(clinic_id));


-- ======================== doctors ========================

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_select_own" ON doctors
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "doctors_select_clinic" ON doctors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_staff cs1
      JOIN clinic_staff cs2 ON cs1.clinic_id = cs2.clinic_id
      WHERE cs1.profile_id = auth.uid() AND cs2.profile_id = doctors.id
        AND cs1.is_active = true AND cs2.is_active = true
    )
  );

CREATE POLICY "doctors_select_patient" ON doctors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_clinic_registrations pcr
      JOIN clinic_staff cs ON cs.clinic_id = pcr.clinic_id
      WHERE pcr.patient_id = auth.uid() AND cs.profile_id = doctors.id
        AND pcr.is_active = true AND cs.is_active = true
    )
  );

CREATE POLICY "doctors_select_admin" ON doctors
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "doctors_update_own" ON doctors
  FOR UPDATE USING (id = auth.uid());


-- ======================== clinic_staff ========================

ALTER TABLE clinic_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cs_select_same_clinic" ON clinic_staff
  FOR SELECT USING (is_clinic_staff_for(clinic_id));

CREATE POLICY "cs_select_admin" ON clinic_staff
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "cs_manage_clinic_admin" ON clinic_staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_staff cs
      WHERE cs.profile_id = auth.uid() AND cs.clinic_id = clinic_staff.clinic_id
        AND cs.staff_role = 'admin' AND cs.is_active = true
    )
  );

CREATE POLICY "cs_manage_admin" ON clinic_staff
  FOR ALL USING (is_medixus_admin());


-- ======================== health_checkups ========================

ALTER TABLE health_checkups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hc_select_own" ON health_checkups
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "hc_select_staff" ON health_checkups
  FOR SELECT USING (patient_in_my_clinic(patient_id));

CREATE POLICY "hc_select_admin" ON health_checkups
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "hc_insert_own" ON health_checkups
  FOR INSERT WITH CHECK (patient_id = auth.uid());


-- ======================== vital_records ========================

ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vr_select_own" ON vital_records
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "vr_select_staff" ON vital_records
  FOR SELECT USING (patient_in_my_clinic(patient_id));

CREATE POLICY "vr_select_admin" ON vital_records
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "vr_insert_own" ON vital_records
  FOR INSERT WITH CHECK (patient_id = auth.uid());


-- ======================== vital_alerts ========================

ALTER TABLE vital_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "va_select_own" ON vital_alerts
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "va_select_staff" ON vital_alerts
  FOR SELECT USING (patient_in_my_clinic(patient_id));

CREATE POLICY "va_select_admin" ON vital_alerts
  FOR SELECT USING (is_medixus_admin());


-- ======================== risk_scores ========================

ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rs_select_own" ON risk_scores
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "rs_select_staff" ON risk_scores
  FOR SELECT USING (patient_in_my_clinic(patient_id));

CREATE POLICY "rs_select_admin" ON risk_scores
  FOR SELECT USING (is_medixus_admin());


-- ======================== ai_consultations ========================

ALTER TABLE ai_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aic_select_own" ON ai_consultations
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "aic_select_staff" ON ai_consultations
  FOR SELECT USING (patient_in_my_clinic(patient_id));

CREATE POLICY "aic_select_admin" ON ai_consultations
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "aic_insert_own" ON ai_consultations
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "aic_update_own" ON ai_consultations
  FOR UPDATE USING (patient_id = auth.uid());


-- ======================== appointments ========================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apt_select_own_patient" ON appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "apt_select_own_doctor" ON appointments
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "apt_select_staff" ON appointments
  FOR SELECT USING (is_clinic_staff_for(clinic_id));

CREATE POLICY "apt_select_admin" ON appointments
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "apt_insert_staff" ON appointments
  FOR INSERT WITH CHECK (is_clinic_staff_for(clinic_id));

CREATE POLICY "apt_update_staff" ON appointments
  FOR UPDATE USING (is_clinic_staff_for(clinic_id));


-- ======================== video_sessions ========================

ALTER TABLE video_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vs_select_appointment" ON video_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = video_sessions.appointment_id
        AND (a.patient_id = auth.uid() OR a.doctor_id = auth.uid())
    )
  );

CREATE POLICY "vs_select_admin" ON video_sessions
  FOR SELECT USING (is_medixus_admin());


-- ======================== consents ========================

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "con_select_own" ON consents
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "con_select_staff" ON consents
  FOR SELECT USING (patient_in_my_clinic(patient_id));

CREATE POLICY "con_select_admin" ON consents
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "con_insert_own" ON consents
  FOR INSERT WITH CHECK (patient_id = auth.uid());


-- ======================== medical_records ========================

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mr_select_own" ON medical_records
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "mr_select_doctor" ON medical_records
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "mr_select_staff" ON medical_records
  FOR SELECT USING (
    is_clinic_staff_for(clinic_id)
    AND EXISTS (
      SELECT 1 FROM clinic_staff cs
      WHERE cs.profile_id = auth.uid() AND cs.clinic_id = medical_records.clinic_id
        AND cs.staff_role IN ('managing_doctor', 'doctor', 'nurse', 'admin')
    )
  );

CREATE POLICY "mr_select_admin" ON medical_records
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "mr_insert_doctor" ON medical_records
  FOR INSERT WITH CHECK (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clinic_staff cs
      WHERE cs.profile_id = auth.uid() AND cs.clinic_id = medical_records.clinic_id
        AND cs.staff_role IN ('managing_doctor', 'doctor', 'admin')
    )
  );

CREATE POLICY "mr_update_doctor" ON medical_records
  FOR UPDATE USING (
    doctor_id = auth.uid() AND is_finalized = false
  );


-- ======================== diagnoses ========================

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dx_select_own" ON diagnoses
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "dx_select_staff" ON diagnoses
  FOR SELECT USING (patient_in_my_clinic(patient_id));

CREATE POLICY "dx_select_admin" ON diagnoses
  FOR SELECT USING (is_medixus_admin());


-- ======================== prescriptions ========================

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rx_select_own" ON prescriptions
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "rx_select_doctor" ON prescriptions
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "rx_select_staff" ON prescriptions
  FOR SELECT USING (is_clinic_staff_for(clinic_id));

CREATE POLICY "rx_select_admin" ON prescriptions
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "rx_insert_doctor" ON prescriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('doctor', 'clinic_admin')
    )
  );

CREATE POLICY "rx_update_doctor" ON prescriptions
  FOR UPDATE USING (doctor_id = auth.uid());


-- ======================== prescription_items ========================

ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rxi_select_via_rx" ON prescription_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions rx
      WHERE rx.id = prescription_items.prescription_id
        AND (rx.patient_id = auth.uid() OR rx.doctor_id = auth.uid())
    )
  );

CREATE POLICY "rxi_select_admin" ON prescription_items
  FOR SELECT USING (is_medixus_admin());


-- ======================== insurance_claims ========================

ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ic_select_staff" ON insurance_claims
  FOR SELECT USING (is_clinic_staff_for(clinic_id));

CREATE POLICY "ic_select_admin" ON insurance_claims
  FOR SELECT USING (is_medixus_admin());


-- ======================== partner_pharmacies ========================

ALTER TABLE partner_pharmacies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pp_select_all_auth" ON partner_pharmacies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "pp_manage_admin" ON partner_pharmacies
  FOR ALL USING (is_medixus_admin());


-- ======================== partner_labs ========================

ALTER TABLE partner_labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pl_select_all_auth" ON partner_labs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "pl_manage_admin" ON partner_labs
  FOR ALL USING (is_medixus_admin());


-- ======================== lab_orders ========================

ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lo_select_own" ON lab_orders
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "lo_select_doctor" ON lab_orders
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "lo_select_staff" ON lab_orders
  FOR SELECT USING (is_clinic_staff_for(clinic_id));

CREATE POLICY "lo_select_admin" ON lab_orders
  FOR SELECT USING (is_medixus_admin());


-- ======================== payments ========================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pay_select_own" ON payments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "pay_select_staff" ON payments
  FOR SELECT USING (is_clinic_staff_for(clinic_id));

CREATE POLICY "pay_select_admin" ON payments
  FOR SELECT USING (is_medixus_admin());


-- ======================== notifications ========================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "notif_update_own" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY "notif_select_admin" ON notifications
  FOR SELECT USING (is_medixus_admin());


-- ======================== messages ========================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "msg_select_participant" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "msg_insert_auth" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "msg_select_admin" ON messages
  FOR SELECT USING (is_medixus_admin());


-- ======================== medication_logs ========================

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ml_select_own" ON medication_logs
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "ml_select_staff" ON medication_logs
  FOR SELECT USING (patient_in_my_clinic(patient_id));

CREATE POLICY "ml_select_admin" ON medication_logs
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "ml_insert_own" ON medication_logs
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "ml_update_own" ON medication_logs
  FOR UPDATE USING (patient_id = auth.uid());


-- ======================== audit_logs ========================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "al_select_admin" ON audit_logs
  FOR SELECT USING (is_medixus_admin());

CREATE POLICY "al_insert_auth" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
