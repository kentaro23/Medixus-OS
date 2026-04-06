import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
    const purpose = searchParams.get("purpose"); // フィルター
    const requiresCallback = searchParams.get("requires_callback"); // "true" | null

    let query = supabase
      .from("phone_call_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);

    if (purpose && purpose !== "all") {
      query = query.eq("purpose", purpose);
    }
    if (requiresCallback === "true") {
      query = query.eq("transferred_to_staff", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[phone/logs] DB error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [], total: data?.length ?? 0 });
  } catch (err) {
    console.error("[phone/logs] error:", err);
    return NextResponse.json({ error: "データ取得に失敗しました" }, { status: 500 });
  }
}

// 折り返し済みマーク
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await request.json() as { id: string };
    if (!id) return NextResponse.json({ error: "id は必須です" }, { status: 400 });

    const { error } = await supabase
      .from("phone_call_logs")
      .update({ transferred_to_staff: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[phone/logs PATCH] error:", err);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
