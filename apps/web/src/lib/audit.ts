import { createClient } from "./supabase/client";

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "export"
  | "print"
  | "prescribe"
  | "approve"
  | "reject"
  | "access_patient_data"
  | "access_medical_record";

export interface AuditLogParams {
  actorId: string;
  actorRole: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  clinicId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
}

/**
 * 監査ログをDBに記録する（クライアントサイド用）
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("audit_logs").insert({
      actor_id: params.actorId,
      actor_role: params.actorRole,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId ?? null,
      clinic_id: params.clinicId ?? null,
      old_values: params.oldValues ?? null,
      new_values: params.newValues ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
      request_path: params.requestPath ?? null,
    });
  } catch (error) {
    console.error("[Audit] Failed to write audit log:", error);
  }
}

/**
 * サーバーサイド用: Request オブジェクトからメタデータを抽出して監査ログ記録
 */
export async function logAuditFromRequest(
  params: Omit<AuditLogParams, "ipAddress" | "userAgent" | "requestPath"> & {
    request?: Request;
  }
): Promise<void> {
  return logAudit({
    ...params,
    ipAddress: params.request?.headers.get("x-forwarded-for") ?? undefined,
    userAgent: params.request?.headers.get("user-agent") ?? undefined,
    requestPath: params.request?.url ?? undefined,
  });
}
