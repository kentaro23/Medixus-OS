type RoleForMasking =
  | "patient"
  | "doctor"
  | "nurse"
  | "clerk"
  | "clinic_admin"
  | "medixus_admin";

const FULL_ACCESS_ROLES: RoleForMasking[] = [
  "doctor",
  "clinic_admin",
  "medixus_admin",
];
const NAME_FULL_ROLES: RoleForMasking[] = [
  "patient",
  "doctor",
  "clinic_admin",
  "medixus_admin",
];

/**
 * 氏名マスキング
 * - 患者本人・医師・管理者: フル表示
 * - 事務/看護師: 姓のみ + **
 */
export function maskName(name: string, role: RoleForMasking): string {
  if (NAME_FULL_ROLES.includes(role)) return name;
  const lastName = name.split(/[\s\u3000]/)[0];
  return `${lastName}**`;
}

/**
 * 電話番号マスキング
 * - 医師・管理者: フル表示
 * - その他: 下4桁以外を隠す
 */
export function maskPhone(phone: string, role: RoleForMasking): string {
  if (FULL_ACCESS_ROLES.includes(role)) return phone;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  const last4 = digits.slice(-4);
  const masked = digits.slice(0, -4).replace(/\d/g, "x");
  return formatPhone(`${masked}${last4}`);
}

/**
 * 保険証番号マスキング
 * - 医師・事務・管理者: フル表示
 * - その他: 完全に非表示
 */
export function maskInsurance(
  value: string,
  role: RoleForMasking
): string | null {
  const allowed: RoleForMasking[] = [
    "doctor",
    "clerk",
    "clinic_admin",
    "medixus_admin",
  ];
  if (allowed.includes(role)) return value;
  return null;
}

/**
 * 住所マスキング
 * - 患者本人・医師・管理者: フル表示
 * - 事務: 市区町村まで
 */
export function maskAddress(address: string, role: RoleForMasking): string {
  if (NAME_FULL_ROLES.includes(role)) return address;
  const match = address.match(
    /^(.+?[都道府県])(.+?[市区町村郡])/
  );
  if (match) return `${match[1]}${match[2]}**`;
  const simpleMatch = address.match(/^(.{4,8})/);
  return simpleMatch ? `${simpleMatch[1]}**` : "**";
}

function formatPhone(digits: string): string {
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}
