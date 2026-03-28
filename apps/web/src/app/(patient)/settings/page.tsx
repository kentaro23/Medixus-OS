"use client";

import { useState } from "react";
import {
  User,
  Shield,
  CreditCard,
  Bell,
  Heart,
  Pill,
  AlertTriangle,
  Save,
  Camera,
  Plus,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRole } from "@/lib/role-context";

type SettingsTab =
  | "profile"
  | "insurance"
  | "medical"
  | "notifications"
  | "security";

const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "基本情報", icon: User },
  { id: "insurance", label: "保険証", icon: CreditCard },
  { id: "medical", label: "医療情報", icon: Heart },
  { id: "notifications", label: "通知設定", icon: Bell },
  { id: "security", label: "セキュリティ", icon: Shield },
];

export default function SettingsPage() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    displayName: user?.displayName || "田中 太郎",
    email: user?.email || "tanaka@example.com",
    phone: "090-1234-5678",
    postalCode: "150-0001",
    address: "東京都渋谷区神宮前1-2-3",
    dateOfBirth: "1975-06-15",
    gender: "male",
    emergencyContactName: "田中 花子",
    emergencyContactPhone: "090-8765-4321",
  });

  const [allergies, setAllergies] = useState(["ペニシリン"]);
  const [newAllergy, setNewAllergy] = useState("");
  const [medications, setMedications] = useState(["アムロジピン5mg 1日1回朝食後"]);
  const [newMed, setNewMed] = useState("");
  const [medicalHistory, setMedicalHistory] = useState(["2015年 高血圧症"]);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  }

  function addItem(list: string[], setter: (v: string[]) => void, value: string, valueSetter: (v: string) => void) {
    if (value.trim()) {
      setter([...list, value.trim()]);
      valueSetter("");
    }
  }

  function removeItem(list: string[], setter: (v: string[]) => void, index: number) {
    setter(list.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-1">プロフィールと各種設定を管理します</p>
      </div>

      <div className="flex gap-6">
        <nav className="w-56 shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">基本情報</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                    {profile.displayName[0]}
                  </div>
                  <Button variant="outline" size="sm">
                    <Camera size={14} className="mr-1" /> 写真を変更
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>氏名</Label>
                    <Input
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>メールアドレス</Label>
                    <Input value={profile.email} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>電話番号</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>生年月日</Label>
                    <Input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>性別</Label>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">その他</option>
                      <option value="prefer_not_to_say">回答しない</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>郵便番号</Label>
                    <Input
                      value={profile.postalCode}
                      onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>住所</Label>
                  <Input
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-sm mb-3">緊急連絡先</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>氏名</Label>
                      <Input
                        value={profile.emergencyContactName}
                        onChange={(e) =>
                          setProfile({ ...profile, emergencyContactName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>電話番号</Label>
                      <Input
                        value={profile.emergencyContactPhone}
                        onChange={(e) =>
                          setProfile({ ...profile, emergencyContactPhone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  <Save size={16} className="mr-2" />
                  {saving ? "保存中..." : "保存する"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "insurance" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">保険証情報</h2>
                <p className="text-sm text-gray-500">保険証データは暗号化して保存されます</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <CreditCard className="mx-auto text-gray-400 mb-3" size={40} />
                  <p className="text-sm text-gray-600 mb-2">保険証の画像をアップロード</p>
                  <p className="text-xs text-gray-400 mb-4">
                    JPG, PNG形式。OCRで自動読取します。
                  </p>
                  <Button variant="outline" size="sm">
                    <Camera size={14} className="mr-1" /> 撮影/アップロード
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>保険者番号</Label>
                    <Input placeholder="例: 06130012" />
                  </div>
                  <div className="space-y-2">
                    <Label>記号</Label>
                    <Input placeholder="例: 1234" />
                  </div>
                  <div className="space-y-2">
                    <Label>番号</Label>
                    <Input placeholder="例: 567890" />
                  </div>
                  <div className="space-y-2">
                    <Label>有効期限</Label>
                    <Input type="date" />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  <Save size={16} className="mr-2" />
                  {saving ? "保存中..." : "保存する"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "medical" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">医療情報</h2>
                <p className="text-sm text-gray-500">AI問診や処方チェックに使用されます</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-amber-500" /> アレルギー
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {allergies.map((a, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm flex items-center gap-1">
                        {a}
                        <button onClick={() => removeItem(allergies, setAllergies, i)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="アレルギーを追加"
                      onKeyDown={(e) => e.key === "Enter" && addItem(allergies, setAllergies, newAllergy, setNewAllergy)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(allergies, setAllergies, newAllergy, setNewAllergy)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Pill size={16} className="text-blue-500" /> 服薬中の薬
                  </Label>
                  <div className="space-y-2 mb-2">
                    {medications.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm">
                        <span className="flex-1">{m}</span>
                        <button onClick={() => removeItem(medications, setMedications, i)}>
                          <X size={14} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMed}
                      onChange={(e) => setNewMed(e.target.value)}
                      placeholder="薬名と用法を入力"
                      onKeyDown={(e) => e.key === "Enter" && addItem(medications, setMedications, newMed, setNewMed)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(medications, setMedications, newMed, setNewMed)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Heart size={16} className="text-pink-500" /> 既往歴
                  </Label>
                  <div className="space-y-2 mb-2">
                    {medicalHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="flex-1">{h}</span>
                        <button onClick={() => removeItem(medicalHistory, setMedicalHistory, i)}>
                          <X size={14} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  <Save size={16} className="mr-2" />
                  {saving ? "保存中..." : "保存する"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">通知設定</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "予約リマインダー", desc: "予約の24時間前・1時間前に通知", default: true },
                  { label: "服薬リマインダー", desc: "服薬時間にプッシュ通知", default: true },
                  { label: "バイタル異常アラート", desc: "異常値検知時に通知", default: true },
                  { label: "検査結果通知", desc: "検査結果が到着した時に通知", default: true },
                  { label: "メッセージ通知", desc: "医師からのメッセージ受信時", default: true },
                  { label: "お知らせ", desc: "クリニックからのお知らせ", default: false },
                ].map((item, i) => (
                  <label key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={item.default} className="w-4 h-4 accent-indigo-600" />
                  </label>
                ))}

                <Button onClick={handleSave} disabled={saving}>
                  <Save size={16} className="mr-2" />
                  {saving ? "保存中..." : "保存する"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">セキュリティ</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">パスワード変更</h3>
                  <div className="grid gap-3">
                    <Input type="password" placeholder="現在のパスワード" />
                    <Input type="password" placeholder="新しいパスワード（8文字以上）" />
                    <Input type="password" placeholder="新しいパスワード（確認）" />
                  </div>
                  <Button variant="outline" size="sm">
                    パスワードを変更
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-sm font-medium">2要素認証</h3>
                  <p className="text-xs text-gray-500">
                    ログイン時に追加の認証コードを要求します
                  </p>
                  <Button variant="outline" size="sm">
                    2要素認証を設定
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-sm font-medium">ログイン中のデバイス</h3>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium">現在のデバイス</p>
                    <p className="text-xs text-gray-500">最終アクセス: 今</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-sm font-medium text-red-600">アカウント削除</h3>
                  <p className="text-xs text-gray-500">
                    アカウントを削除すると、全てのデータが失われます。この操作は取り消せません。
                  </p>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    アカウントを削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
