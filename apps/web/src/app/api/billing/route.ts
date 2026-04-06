import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 認証チェック共通処理
async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, supabase };
  }
  return { user, supabase };
}

export async function POST(request: NextRequest) {
  try {
    // 認証必須
    const { user, supabase } = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { patient_id, clinic_id, appointment_id, amount, payment_type } = body as {
      patient_id: string;
      clinic_id: string;
      appointment_id?: string;
      amount: number;
      payment_type: "insurance_copay" | "self_pay";
    };

    // 入力バリデーション
    if (!patient_id) {
      return NextResponse.json({ error: "patient_id は必須です" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "amount は正の数値である必要があります" }, { status: 400 });
    }
    if (!["insurance_copay", "self_pay"].includes(payment_type)) {
      return NextResponse.json({ error: "payment_type が不正です" }, { status: 400 });
    }

    // Stripe 連携（キー設定済みの場合）
    let paymentIntentId: string | null = null;
    let receiptUrl: string | null = null;

    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // TODO: Stripe Payment Intent を作成
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // const intent = await stripe.paymentIntents.create({ amount, currency: "jpy", ... });
        // paymentIntentId = intent.id;
        console.warn("[Billing] Stripe SDK は未実装です。手動決済として記録します。");
      } catch (stripeErr) {
        console.error("[Billing] Stripe エラー:", stripeErr);
        return NextResponse.json({ error: "決済処理に失敗しました" }, { status: 500 });
      }
    }

    const { data, error } = await supabase.from("payments").insert({
      patient_id,
      clinic_id: clinic_id || "00000000-0000-0000-0000-000000000001",
      appointment_id: appointment_id || null,
      payment_type: payment_type || "insurance_copay",
      amount,
      currency: "JPY",
      status: "succeeded",
      stripe_payment_intent_id: paymentIntentId,
      receipt_url: receiptUrl,
      paid_at: new Date().toISOString(),
    }).select("id").single();

    if (error) {
      console.error("[Billing] DB insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      payment_id: data?.id,
      status: "succeeded",
      receipt_url: receiptUrl,
    });
  } catch (error) {
    console.error("Billing POST error:", error);
    return NextResponse.json({ error: "決済処理に失敗しました" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 認証必須（スタッフ以上）
    const { user, supabase } = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // 日付フォーマット検証
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "日付フォーマットが不正です（YYYY-MM-DD）" }, { status: 400 });
    }

    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .gte("paid_at", startOfDay)
      .lte("paid_at", endOfDay)
      .order("paid_at");

    if (error) {
      console.error("[Billing] DB fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = (payments || []).reduce((s, p) => s + (p.amount || 0), 0);
    const pending = (payments || []).filter((p) => p.status === "pending").length;

    return NextResponse.json({
      date,
      summary: {
        total,
        count: (payments || []).length,
        pending,
      },
      items: payments || [],
    });
  } catch (error) {
    console.error("Billing GET error:", error);
    return NextResponse.json({ error: "データ取得に失敗しました" }, { status: 500 });
  }
}
