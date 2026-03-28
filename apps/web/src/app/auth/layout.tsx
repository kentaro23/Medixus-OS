import { Stethoscope } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white flex-col justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Medixus<span className="text-indigo-200">OS</span>
              </h1>
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            「具合が悪くなってから
            <br />
            受診する」を終わらせる
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-md">
            AI問診・オンライン診療・遠隔モニタリングを一気通貫で提供。
            生活習慣病の治療中断率を構造的にゼロにする。
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold">4,300万</p>
              <p className="text-indigo-300 text-sm">高血圧患者数</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50%</p>
              <p className="text-indigo-300 text-sm">治療中断率</p>
            </div>
            <div>
              <p className="text-3xl font-bold">0%</p>
              <p className="text-indigo-300 text-sm">Medixusの目標</p>
            </div>
          </div>
        </div>

        <p className="text-indigo-300 text-xs">
          © {new Date().getFullYear()} Medixus株式会社
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
