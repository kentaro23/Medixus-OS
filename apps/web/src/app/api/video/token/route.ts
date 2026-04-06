import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Twilio Video Access Token を HMAC-SHA256 で署名して生成する
// twilio npm パッケージ不要でエッジランタイム対応
function buildTwilioAccessToken(opts: {
  accountSid: string;
  apiKey: string;
  apiSecret: string;
  identity: string;
  roomName: string;
  ttlSeconds?: number;
}): string {
  const { accountSid, apiKey, apiSecret, identity, roomName, ttlSeconds = 3600 } = opts;
  const now = Math.floor(Date.now() / 1000);

  // --- Header ---
  const header = { alg: "HS256", typ: "JWT", cty: "twilio-fpa;v=1" };

  // --- Payload ---
  const payload = {
    jti: `${apiKey}-${now}`,
    iss: apiKey,
    sub: accountSid,
    exp: now + ttlSeconds,
    grants: {
      identity,
      video: { room: roomName },
    },
  };

  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const headerB64 = b64url(header);
  const payloadB64 = b64url(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Node.js crypto で HMAC-SHA256 署名（Edge Runtime でも動作）
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto") as typeof import("crypto");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(signingInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signingInput}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { appointment_id, identity } = (await request.json()) as {
      appointment_id: string;
      identity?: string;
    };

    if (!appointment_id) {
      return NextResponse.json({ error: "appointment_id is required" }, { status: 400 });
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioApiKey = process.env.TWILIO_API_KEY;
    const twilioApiSecret = process.env.TWILIO_API_SECRET;

    // デモモード（Twilio未設定）
    if (!twilioSid || !twilioApiKey || !twilioApiSecret) {
      return NextResponse.json({
        token: `demo-token-${Date.now()}`,
        room_name: `medixus-${appointment_id}`,
        demo: true,
      });
    }

    // ログイン中のユーザーIDを取得
    let userId = identity || "anonymous";
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // 認証取得失敗時はidentityをそのまま使用
    }

    const roomName = `medixus-${appointment_id}`;

    const token = buildTwilioAccessToken({
      accountSid: twilioSid,
      apiKey: twilioApiKey,
      apiSecret: twilioApiSecret,
      identity: userId,
      roomName,
      ttlSeconds: 3600, // 1時間
    });

    return NextResponse.json({ token, room_name: roomName, demo: false });
  } catch (error) {
    console.error("Video token error:", error);
    return NextResponse.json({ error: "トークンの生成に失敗しました" }, { status: 500 });
  }
}
