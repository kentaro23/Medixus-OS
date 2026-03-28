import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function getKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with: openssl rand -hex 32"
    );
  }
  return Buffer.from(ENCRYPTION_KEY, "hex");
}

/**
 * AES-256-GCM で平文を暗号化する。
 * 戻り値: "iv:authTag:ciphertext" (hex)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * AES-256-GCM で暗号文を復号する。
 * 入力: "iv:authTag:ciphertext" (hex)
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid ciphertext format");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * ENCRYPTION_KEY が設定済みか確認する（起動時チェック用）
 */
export function isEncryptionConfigured(): boolean {
  return !!(
    ENCRYPTION_KEY &&
    ENCRYPTION_KEY.length === 64 &&
    ENCRYPTION_KEY !== ""
  );
}
