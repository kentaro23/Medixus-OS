export type Permission =
  | "read:own_data"
  | "read:clinic_patients"
  | "write:medical_records"
  | "write:prescriptions"
  | "read:prescriptions"
  | "manage:clinic_staff"
  | "manage:appointments"
  | "read:billing"
  | "write:billing"
  | "admin:all";

export type UserRole =
  | "patient"
  | "doctor"
  | "nurse"
  | "clerk"
  | "clinic_admin"
  | "medixus_admin";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  patient: ["read:own_data"],
  doctor: [
    "read:own_data",
    "read:clinic_patients",
    "write:medical_records",
    "write:prescriptions",
    "read:prescriptions",
    "manage:appointments",
  ],
  nurse: ["read:own_data", "read:clinic_patients", "manage:appointments"],
  clerk: [
    "read:own_data",
    "manage:appointments",
    "read:billing",
    "write:billing",
  ],
  clinic_admin: [
    "read:own_data",
    "read:clinic_patients",
    "write:medical_records",
    "write:prescriptions",
    "read:prescriptions",
    "manage:clinic_staff",
    "manage:appointments",
    "read:billing",
    "write:billing",
  ],
  medixus_admin: ["admin:all"],
};

/**
 * 指定ロールが指定パーミッションを持つかチェック
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as UserRole];
  if (!perms) return false;
  return perms.includes("admin:all") || perms.includes(permission);
}

/**
 * 指定ロールの全パーミッション一覧を返す
 */
export function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as UserRole] || [];
}

/**
 * 患者データへのアクセス可否をチェック
 */
export function canAccessPatientData(role: string): boolean {
  return hasPermission(role, "read:clinic_patients") || role === "patient";
}

/**
 * カルテ書き込み権限チェック
 */
export function canWriteMedicalRecords(role: string): boolean {
  return hasPermission(role, "write:medical_records");
}

/**
 * 処方作成権限チェック
 */
export function canWritePrescriptions(role: string): boolean {
  return hasPermission(role, "write:prescriptions");
}

/**
 * ルートパスに対するロール別アクセスルール
 */
const ROUTE_ACCESS: Record<string, UserRole[]> = {
  "/dashboard": ["patient"],
  "/triage": ["patient"],
  "/appointments": ["patient"],
  "/prescriptions": ["patient"],
  "/medications": ["patient"],
  "/health": ["patient"],
  "/messages": ["patient", "doctor"],
  "/doctor": ["doctor"],
  "/clinic": ["clinic_admin", "doctor", "nurse", "clerk"],
  "/admin": ["medixus_admin"],
};

/**
 * 指定パスに対してロールがアクセス可能かチェック
 */
export function canAccessRoute(role: string, pathname: string): boolean {
  if (role === "medixus_admin") return true;
  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (pathname.startsWith(routePrefix)) {
      return allowedRoles.includes(role as UserRole);
    }
  }
  return true;
}
