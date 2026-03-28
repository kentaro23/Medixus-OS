"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "../actions";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await resetPassword(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
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
          <CardTitle className="text-2xl font-bold">パスワードリセット</CardTitle>
          <CardDescription>
            登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-lg">メールを送信しました</p>
                <p className="text-sm text-gray-500 mt-2">
                  メールに記載されたリンクからパスワードを再設定してください。
                  メールが届かない場合はスパムフォルダをご確認ください。
                </p>
              </div>
              <Link href="/auth/login">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft size={16} className="mr-2" />
                  ログインに戻る
                </Button>
              </Link>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

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

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                リセットリンクを送信
              </Button>

              <div className="text-center">
                <Link href="/auth/login" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                  <ArrowLeft size={14} />
                  ログインに戻る
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}
