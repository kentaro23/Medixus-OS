export type UserRole = "patient" | "doctor" | "nurse" | "staff" | "clinic_admin" | "admin";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface Profile {
  id: string;
  role: UserRole;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  first_name_kana: string | null;
  last_name_kana: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  address_line: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientInsurance {
  id: string;
  user_id: string;
  insurer_number: string | null;
  insurer_name: string | null;
  symbol: string | null;
  number: string | null;
  branch_number: string | null;
  holder_relation: string | null;
  valid_from: string | null;
  valid_until: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientMedicalHistory {
  id: string;
  user_id: string;
  allergies: Allergy[];
  past_illnesses: PastIllness[];
  family_history: FamilyHistoryItem[];
  current_medications: CurrentMedication[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Allergy {
  substance: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe";
}

export interface PastIllness {
  name: string;
  diagnosed_year: number | null;
  status: "active" | "resolved";
  notes: string | null;
}

export interface FamilyHistoryItem {
  relation: string;
  condition: string;
}

export interface CurrentMedication {
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string | null;
  start_date: string | null;
}

export interface Doctor {
  id: string;
  user_id: string;
  clinic_id: string | null;
  license_number: string;
  specialties: string[];
  qualifications: string[];
  bio: string | null;
  consultation_fee_online: number | null;
  consultation_fee_inperson: number | null;
  max_daily_patients: number;
  is_accepting_new_patients: boolean;
  schedule: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
