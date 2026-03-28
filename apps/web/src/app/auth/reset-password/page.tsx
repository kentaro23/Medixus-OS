"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-4">
            <CheckCircle2 className="mx-auto text-green-500" size={48} />
            <h2 className="text-xl font-bold">パスワードを変更しました</h2>
            <p className="text-sm text-muted-foreground">
              新しいパスワードでログインできます。
            </p>
            <Button className="w-full" onClick={() => window.location.href = "/auth/login"}>
              ログイン画面へ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Lock className="text-indigo-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold">新しいパスワードを設定</h1>
          <p className="text-sm text-muted-foreground">
            8文字以上の新しいパスワードを入力してください
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">新しいパスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード確認</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="もう一度入力"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "変更中..." : "パスワードを変更"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
