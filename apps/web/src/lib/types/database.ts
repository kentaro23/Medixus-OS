/**
 * Medixus OS データベース型定義
 *
 * Supabase接続後は supabase gen types typescript で自動生成に切り替え。
 * このファイルはそれまでの手動型定義として使用。
 */

export type UserRole = "patient" | "doctor" | "nurse" | "clerk" | "clinic_admin" | "medixus_admin";
export type ClinicType = "own" | "partner";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type AppointmentType =
  | "online_initial" | "online_followup"
  | "in_person_initial" | "in_person_followup"
  | "pre_consultation" | "self_pay";

export type AppointmentStatus =
  | "scheduled" | "waiting" | "in_progress" | "completed" | "cancelled" | "no_show";

export type TriageLevel = "emergency" | "semi_urgent" | "routine" | "observation";
export type AiConsultationStatus = "in_progress" | "completed" | "cancelled";

export type PrescriptionStatus =
  | "draft" | "ai_suggested" | "doctor_approved" | "sent_to_pharmacy"
  | "dispensed" | "delivered" | "cancelled";

export type VitalType =
  | "blood_pressure_systolic" | "blood_pressure_diastolic"
  | "heart_rate" | "blood_glucose" | "body_weight" | "body_temperature"
  | "spo2" | "steps" | "sleep_hours";

export type RiskScoreType = "hypertension" | "diabetes" | "dyslipidemia" | "ckd" | "cardiovascular";

export type ConsentType = "online_diagnosis" | "recording" | "data_sharing" | "treatment_plan" | "privacy_policy";

export type AuditAction =
  | "create" | "read" | "update" | "delete"
  | "login" | "logout" | "export" | "print"
  | "prescribe" | "approve" | "reject"
  | "access_patient_data" | "access_medical_record";

// ======================== テーブル型 ========================

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_seed_data: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  clinic_type: ClinicType;
  postal_code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_seed_data: boolean;
}

export interface Patient {
  id: string;
  date_of_birth: string | null;
  gender: Gender | null;
  postal_code: string | null;
  address: string | null;
  insurance_provider_number: string | null;
  insurance_symbol: string | null;
  insurance_number: string | null;
  insurance_expiry: string | null;
  insurance_card_image_url: string | null;
  allergies: string[];
  medical_history: string[];
  family_history: string[];
  current_medications: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_seed_data: boolean;
}

export interface Doctor {
  id: string;
  license_number: string;
  specialties: string[];
  qualifications: string[];
  bio: string | null;
  consultation_fee_per_minute: number | null;
  is_accepting_new_patients: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_seed_data: boolean;
}

export interface ClinicStaff {
  id: string;
  clinic_id: string;
  profile_id: string;
  staff_role: "managing_doctor" | "doctor" | "nurse" | "clerk" | "admin";
  is_active: boolean;
  joined_at: string;
}

export interface VitalRecord {
  id: string;
  patient_id: string;
  recorded_at: string;
  source: "healthkit" | "google_fit" | "bluetooth" | "manual";
  vital_type: VitalType;
  value: number;
  unit: string;
  is_abnormal: boolean;
  created_at: string;
  is_seed_data: boolean;
}

export interface VitalAlert {
  id: string;
  patient_id: string;
  vital_record_id: string | null;
  alert_type: "high" | "low" | "trend_worsening";
  severity: "info" | "warning" | "critical";
  message: string;
  is_acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  online_consultation_suggested: boolean;
  created_at: string;
  is_seed_data: boolean;
}

export interface RiskScore {
  id: string;
  patient_id: string;
  calculated_at: string;
  score_type: RiskScoreType;
  score: number;
  factors: Record<string, unknown>;
  ai_explanation: string | null;
  created_at: string;
  is_seed_data: boolean;
}

export interface AiConsultation {
  id: string;
  patient_id: string;
  clinic_id: string | null;
  status: AiConsultationStatus;
  started_at: string;
  completed_at: string | null;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  summary: string | null;
  triage_level: TriageLevel | null;
  recommended_tests: string[];
  suggested_prescriptions: string[];
  needs_in_person: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_seed_data: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  scheduled_at: string;
  duration_minutes: number;
  started_at: string | null;
  ended_at: string | null;
  ai_consultation_id: string | null;
  cancel_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_seed_data: boolean;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  appointment_id: string | null;
  record_date: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  ai_consultation_id: string | null;
  attachments: Array<{ url: string; type: string; description: string }>;
  is_finalized: boolean;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_seed_data: boolean;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  medical_record_id: string | null;
  prescription_number: string | null;
  prescription_type: "insurance" | "self_pay";
  status: PrescriptionStatus;
  is_refill: boolean;
  prescribed_at: string | null;
  pharmacy_id: string | null;
  delivery_tracking_number: string | null;
  initial_visit_day_limit_check: boolean;
  contraindication_check: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_seed_data: boolean;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medication_name: string;
  medication_code: string | null;
  dosage: string;
  frequency: string;
  duration_days: number;
  quantity: number;
  is_generic_substitution_allowed: boolean;
  notes: string | null;
  ai_suggested: boolean;
  ai_confidence: number | null;
  doctor_modified: boolean;
  created_at: string;
  is_seed_data: boolean;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  clinic_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  request_path: string | null;
  created_at: string;
}
