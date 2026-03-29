import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    if (!twilioSid || !twilioApiKey || !twilioApiSecret) {
      return NextResponse.json({
        token: "demo-token-" + Date.now(),
        room_name: `medixus-${appointment_id}`,
        demo: true,
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let userId = identity || "anonymous";

    if (supabaseUrl) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) userId = user.id;
    }

    const roomName = `medixus-${appointment_id}`;

    const tokenPayload = {
      identity: userId,
      grants: {
        video: { room: roomName },
      },
    };

    return NextResponse.json({
      token: Buffer.from(JSON.stringify(tokenPayload)).toString("base64"),
      room_name: roomName,
      demo: false,
    });
  } catch (error) {
    console.error("Video token error:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
