"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Loader2, Stethoscope, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "../actions";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください");
      setLoading(false);
      return;
    }

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Stethoscope size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold">
          Medixus<span className="text-indigo-600">OS</span>
        </span>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold">新規アカウント登録</CardTitle>
          <CardDescription>
            MedixusOSのアカウントを作成して、オンライン診療を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lastName">姓</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input id="lastName" name="lastName" placeholder="山田" required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">名</Label>
                <Input id="firstName" name="firstName" placeholder="太郎" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@medixus.jp"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="8文字以上"
                  required
                  minLength={8}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="もう一度入力"
                  required
                  minLength={8}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-start gap-2">
              <Shield size={16} className="shrink-0 mt-0.5" />
              <p>
                お客様の医療情報はAES-256で暗号化され、厚生労働省のガイドラインに準拠して安全に管理されます。
              </p>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <UserPlus size={16} className="mr-2" />
              )}
              アカウントを作成
            </Button>

            <p className="text-xs text-gray-500 text-center">
              登録することで、
              <a href="#" className="text-indigo-600 hover:underline">利用規約</a>
              及び
              <a href="#" className="text-indigo-600 hover:underline">プライバシーポリシー</a>
              に同意したものとします。
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            既にアカウントをお持ちの方は{" "}
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
