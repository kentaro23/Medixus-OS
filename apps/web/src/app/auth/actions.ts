"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const role = (formData.get("role") as string) || "patient";

  if (!email || !password) {
    return { error: "メールアドレスとパスワードは必須です" };
  }
  if (password.length < 8) {
    return { error: "パスワードは8文字以上で入力してください" };
  }

  const displayName = `${lastName} ${firstName}`.trim() || email.split("@")[0];

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        role,
        display_name: displayName,
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "このメールアドレスは既に登録されています" };
    }
    return { error: error.message };
  }

  redirect("/auth/verify?email=" + encodeURIComponent(email));
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "メールアドレスまたはパスワードが正しくありません" };
    }
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role || data.user.user_metadata?.role || "patient";

  switch (role) {
    case "doctor":
    case "nurse":
      redirect("/doctor/dashboard");
      break;
    case "clerk":
    case "clinic_admin":
      redirect("/clinic");
      break;
    case "medixus_admin":
      redirect("/admin");
      break;
    default:
      redirect("/dashboard");
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "メールアドレスを入力してください" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signInWithOAuth(provider: "google" | "apple") {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.url) {
    redirect(data.url);
  }
}
