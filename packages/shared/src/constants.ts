export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  NURSE: "nurse",
  STAFF: "staff",
  CLINIC_ADMIN: "clinic_admin",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const APPOINTMENT_TYPES = {
  INITIAL: "initial",
  FOLLOW_UP: "follow_up",
  ONLINE: "online",
  PRE_CONSULTATION: "pre_consultation",
  MONITORING_REVIEW: "monitoring_review",
} as const;

export const TRIAGE_URGENCY = {
  EMERGENCY: "emergency",
  SEMI_URGENT: "semi_urgent",
  NORMAL: "normal",
  OBSERVATION: "observation",
} as const;

export const PRESCRIPTION_STATUS = {
  DRAFT: "draft",
  SIGNED: "signed",
  SENT: "sent",
  DISPENSED: "dispensed",
  CANCELLED: "cancelled",
} as const;

export const LEGAL_CONSTRAINTS = {
  FIRST_VISIT_MAX_DAYS: 8,
  CONTROLLED_SUBSTANCES_ONLINE_BLOCKED: true,
  ED_DRUGS_FIRST_VISIT_BLOCKED: true,
  AUTO_LOGOUT_MINUTES: 15,
} as const;

export const AI_DISCLAIMER =
  "AIの提案です。最終的な診断・治療の判断は必ず医師が行います。";
