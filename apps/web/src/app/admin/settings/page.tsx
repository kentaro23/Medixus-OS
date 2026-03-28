"use client";

import {
  Building,
  Users,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
} from "lucide-react";

const settingsSections = [
  {
    title: "組織設定",
    icon: <Building size={20} />,
    items: [
      {
        label: "法人情報",
        description: "Medixus株式会社の基本情報",
        value: "Medixus株式会社",
      },
      {
        label: "一般社団法人",
        description: "診療所開設法人の情報",
        value: "設立予定",
      },
      {
        label: "管理者メール",
        description: "システム管理者のメールアドレス",
        value: "admin@medixus.jp",
      },
    ],
  },
  {
    title: "ユーザー管理",
    icon: <Users size={20} />,
    items: [
      { label: "アクティブユーザー", description: "現在のシステムユーザー数", value: "5名" },
      { label: "ロール管理", description: "Admin / Manager / Viewer", value: "3ロール" },
      { label: "招待中", description: "承認待ちの招待", value: "2名" },
    ],
  },
  {
    title: "セキュリティ",
    icon: <Shield size={20} />,
    items: [
      { label: "二要素認証", description: "2FA設定", value: "有効" },
      { label: "セッションタイムアウト", description: "自動ログアウト時間", value: "30分" },
      { label: "IPホワイトリスト", description: "アクセス制限", value: "未設定" },
    ],
  },
  {
    title: "通知設定",
    icon: <Bell size={20} />,
    items: [
      { label: "メール通知", description: "アラート・レポートの送信", value: "有効" },
      { label: "Slack連携", description: "Slackチャンネルへの通知", value: "未設定" },
      { label: "日次レポート", description: "KPIサマリーの自動送信", value: "有効" },
    ],
  },
  {
    title: "API設定",
    icon: <Key size={20} />,
    items: [
      { label: "APIキー", description: "外部連携用APIキー", value: "****-****-****" },
      { label: "Webhook URL", description: "イベント通知先URL", value: "未設定" },
      { label: "レート制限", description: "API呼び出し制限", value: "1000/時間" },
    ],
  },
  {
    title: "データ管理",
    icon: <Database size={20} />,
    items: [
      { label: "バックアップ", description: "自動バックアップ設定", value: "日次" },
      { label: "データ保持期間", description: "ログデータの保持期間", value: "3年" },
      { label: "エクスポート", description: "データの一括出力", value: "CSV / JSON" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
        <p className="text-gray-500 text-sm mt-1">
          システム設定・組織管理・セキュリティ
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <div
            key={section.title}
            className="bg-card-bg border border-card-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-accent">{section.icon}</span>
              <h2 className="font-semibold text-lg">{section.title}</h2>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
