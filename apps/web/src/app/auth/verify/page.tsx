import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={32} className="text-indigo-600" />
        </div>
        <CardTitle className="text-2xl font-bold">メールを確認してください</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-500">
          {email ? (
            <>
              <span className="font-medium text-gray-700">{email}</span>
              <br />
              に確認メールを送信しました。
            </>
          ) : (
            "登録されたメールアドレスに確認メールを送信しました。"
          )}
        </p>
        <p className="text-sm text-gray-400">
          メールに記載されたリンクをクリックして、アカウントを有効化してください。
          メールが届かない場合はスパムフォルダをご確認ください。
        </p>
        <Link href="/auth/login">
          <Button variant="outline" className="mt-4">
            <ArrowLeft size={16} className="mr-2" />
            ログインページへ
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
