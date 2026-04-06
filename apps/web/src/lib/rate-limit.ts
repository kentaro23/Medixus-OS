/**
 * シンプルなインメモリ レート制限ユーティリティ
 * Vercel Edge/Serverless でも動作する軽量実装
 * 本番でスケールが必要になったら Upstash Redis に移行推奨
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// サーバーレス関数はリクエストごとにインスタンスが異なる可能性があるため
// グローバルオブジェクトに保持してウォームインスタンス内でのみ共有
const store = new Map<string, RateLimitEntry>();

// 古いエントリを定期的に掃除（メモリリーク防止）
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export interface RateLimitConfig {
  /** 時間窓（ミリ秒）。デフォルト: 60秒 */
  windowMs?: number;
  /** 時間窓内の最大リクエスト数。デフォルト: 30 */
  max?: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // 秒単位
}

/**
 * レート制限チェック
 * @param key 識別子（IP アドレス、ユーザー ID など）
 * @param config オプション設定
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { windowMs = 60_000, max = 30 } = config;
  const now = Date.now();

  // 10 リクエストに 1 回クリーンアップ
  if (Math.random() < 0.1) cleanup();

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // 新規 or 期限切れ → カウンタをリセット
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    store.set(key, newEntry);
    return { success: true, remaining: max - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= max) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: max - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Next.js Route Handler 用ヘルパー
 * IP アドレスをキーにしてレート制限を適用する
 */
export function getRateLimitKey(request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const url = new URL(request.url);
  return `${ip}:${url.pathname}`;
}
