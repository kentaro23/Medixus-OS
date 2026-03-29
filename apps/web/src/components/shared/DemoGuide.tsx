"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Lightbulb, X } from "lucide-react";
import { IS_DEMO } from "@/lib/env";

const DEMO_GUIDES: Record<string, string> = {
  "/clinic": "「さくら内科クリニック」の管理画面。左メニューの「対面業務DX」セクションから各SaaSを紹介してください",
  "/clinic/phone": "「今月のAI対応率78%です。電話の8割をAIが自動対応しています」と説明。テスト着信ボタンで実演可能",
  "/clinic/queue": "「次の患者を呼ぶ」を押して、サイネージ画面（別タブ）の番号が即更新されるのを見せる",
  "/clinic/line": "「患者さんのLINEに自動で呼出通知が届きます。外出中でも安心です」と説明",
  "/clinic/questionnaires": "「来院前にスマホで問診完了。紙の問診票がゼロになります」。テンプレートを見せる",
  "/clinic/billing": "「現金・クレカ・QRに対応。会計処理を押すだけ。領収書も自動PDF」と説明",
  "/clinic/signage": "「プレビュー」を押して待合室のモニター画面を見せる。コンテンツは管理画面から簡単に編集可能",
  "/doctor/dashboard": "「山田太郎さん」をクリック → バイタル推移 + AI問診サマリーが1画面で見える。未対応タスクも一覧",
  "/doctor/patients": "患者をクリックすると、全情報（バイタル・問診・処方・カルテ）が1画面に統合表示される",
  "/doctor/prescriptions/new": "AI問診の結果から処方候補が自動プリセット。禁忌チェック・初診制限も自動",
  "/dashboard": "患者のダッシュボード。バイタル・服薬・リスクスコアが一目瞭然。「オンライン診療を申し込む」ボタンを見せる",
  "/consultation": "AI問診を2-3問やってみせる。トリアージ結果 → オンライン診療予約の流れ",
  "/appointments": "カレンダーから予約を取る流れ。タイプ選択 → 医師選択 → 日時選択 → 確定",
  "/health": "30日分のバイタルグラフ。異常値は赤表示。手動入力も可能",
  "/medications": "処方薬の服用記録。飲んだ/スキップ/副作用の3択。残薬管理も",
};

export default function DemoGuide() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (!IS_DEMO) return null;

  const guide = Object.entries(DEMO_GUIDES).find(([path]) => {
    if (path === pathname) return true;
    if (pathname.startsWith(path) && path !== "/") return true;
    return false;
  });

  if (!guide) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="デモガイド"
        >
          <Lightbulb size={22} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden animate-fade-in">
          <div className="bg-amber-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-800">デモガイド</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-amber-400 hover:text-amber-600">
              <X size={16} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{guide[1]}</p>
          </div>
        </div>
      )}
    </>
  );
}
