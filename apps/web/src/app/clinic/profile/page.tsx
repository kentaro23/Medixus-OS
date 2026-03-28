"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Heart,
  Pill,
  AlertTriangle,
  Users,
  Save,
  CreditCard,
  Camera,
  Plus,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const prefectures = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allergies, setAllergies] = useState<{ substance: string; reaction: string; severity: string }[]>([
    { substance: "ペニシリン系", reaction: "蕁麻疹", severity: "moderate" },
  ]);
  const [medications, setMedications] = useState([
    { name: "メトホルミン", dosage: "500mg", frequency: "1日2回", prescriber: "田中医師" },
  ]);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">プロフィール</h1>
          <p className="text-muted-foreground text-sm mt-1">
            基本情報・保険証・既往歴・アレルギー・服薬情報を管理
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
          {saving ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : saved ? (
            <CheckCircle2 size={16} className="mr-2 text-green-300" />
          ) : (
            <Save size={16} className="mr-2" />
          )}
          {saved ? "保存しました" : "保存"}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic"><User size={14} className="mr-1.5" />基本情報</TabsTrigger>
          <TabsTrigger value="insurance"><CreditCard size={14} className="mr-1.5" />保険証</TabsTrigger>
          <TabsTrigger value="medical"><Heart size={14} className="mr-1.5" />医療情報</TabsTrigger>
          <TabsTrigger value="security"><Shield size={14} className="mr-1.5" />セキュリティ</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>氏名・連絡先・住所などの基本情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-indigo-600" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <p className="font-medium">プロフィール写真</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG 最大2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>姓</Label>
                  <Input defaultValue="山田" />
                </div>
                <div className="space-y-2">
                  <Label>名</Label>
                  <Input defaultValue="太郎" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>姓（カナ）</Label>
                  <Input defaultValue="ヤマダ" />
                </div>
                <div className="space-y-2">
                  <Label>名（カナ）</Label>
                  <Input defaultValue="タロウ" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>生年月日</Label>
                  <Input type="date" defaultValue="1980-05-15" />
                </div>
                <div className="space-y-2">
                  <Label>性別</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background">
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                    <option value="prefer_not_to_say">回答しない</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label><Mail size={14} className="inline mr-1" />メールアドレス</Label>
                  <Input type="email" defaultValue="taro.yamada@example.com" />
                </div>
                <div className="space-y-2">
                  <Label><Phone size={14} className="inline mr-1" />電話番号</Label>
                  <Input type="tel" defaultValue="090-1234-5678" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>郵便番号</Label>
                  <Input defaultValue="150-0001" placeholder="000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>都道府県</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background">
                    {prefectures.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>市区町村</Label>
                  <Input defaultValue="渋谷区神宮前" />
                </div>
              </div>
              <div className="space-y-2">
                <Label><MapPin size={14} className="inline mr-1" />番地・建物名</Label>
                <Input defaultValue="3-1-15 メゾン渋谷 301" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>保険証情報</CardTitle>
              <CardDescription>健康保険証の情報を登録してください。OCR読取にも対応しています。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer">
                  <Camera size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">保険証（表面）</p>
                  <p className="text-xs text-muted-foreground">クリックして撮影・アップロード</p>
                </div>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer">
                  <Camera size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">保険証（裏面）</p>
                  <p className="text-xs text-muted-foreground">クリックして撮影・アップロード</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>保険者番号</Label>
                  <Input placeholder="8桁の番号" />
                </div>
                <div className="space-y-2">
                  <Label>保険者名称</Label>
                  <Input placeholder="例: 全国健康保険協会" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>記号</Label>
                  <Input />
                </div>
                <div className="space-y-2">
                  <Label>番号</Label>
                  <Input />
                </div>
                <div className="space-y-2">
                  <Label>枝番</Label>
                  <Input />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>本人/家族</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background">
                    <option>本人</option>
                    <option>家族</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>有効期限</Label>
                  <Input type="date" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" /> アレルギー情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allergies.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input value={a.substance} placeholder="物質名" onChange={(e) => { const n = [...allergies]; n[i].substance = e.target.value; setAllergies(n); }} />
                      <Input value={a.reaction} placeholder="反応" onChange={(e) => { const n = [...allergies]; n[i].reaction = e.target.value; setAllergies(n); }} />
                      <select
                        value={a.severity}
                        onChange={(e) => { const n = [...allergies]; n[i].severity = e.target.value; setAllergies(n); }}
                        className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                      >
                        <option value="mild">軽度</option>
                        <option value="moderate">中等度</option>
                        <option value="severe">重度</option>
                      </select>
                    </div>
                    <button onClick={() => setAllergies(allergies.filter((_, j) => j !== i))} className="p-1 hover:bg-amber-100 rounded"><X size={16} className="text-amber-600" /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setAllergies([...allergies, { substance: "", reaction: "", severity: "mild" }])}>
                  <Plus size={14} className="mr-1" /> アレルギーを追加
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill size={18} className="text-blue-500" /> 現在の服薬
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {medications.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <Input value={m.name} placeholder="薬剤名" onChange={(e) => { const n = [...medications]; n[i].name = e.target.value; setMedications(n); }} />
                      <Input value={m.dosage} placeholder="用量" onChange={(e) => { const n = [...medications]; n[i].dosage = e.target.value; setMedications(n); }} />
                      <Input value={m.frequency} placeholder="用法" onChange={(e) => { const n = [...medications]; n[i].frequency = e.target.value; setMedications(n); }} />
                      <Input value={m.prescriber || ""} placeholder="処方医" onChange={(e) => { const n = [...medications]; n[i].prescriber = e.target.value; setMedications(n); }} />
                    </div>
                    <button onClick={() => setMedications(medications.filter((_, j) => j !== i))} className="p-1 hover:bg-blue-100 rounded"><X size={16} className="text-blue-600" /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setMedications([...medications, { name: "", dosage: "", frequency: "", prescriber: "" }])}>
                  <Plus size={14} className="mr-1" /> 服薬を追加
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={18} className="text-green-500" /> 緊急連絡先
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>氏名</Label>
                    <Input placeholder="山田 花子" />
                  </div>
                  <div className="space-y-2">
                    <Label>電話番号</Label>
                    <Input type="tel" placeholder="090-0000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>続柄</Label>
                    <Input placeholder="配偶者" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>セキュリティ設定</CardTitle>
              <CardDescription>パスワード・2要素認証・デバイス管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-medium">パスワード変更</p>
                  <p className="text-sm text-muted-foreground">定期的な変更を推奨します</p>
                </div>
                <Button variant="outline">変更する</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-medium">2要素認証（2FA）</p>
                  <p className="text-sm text-muted-foreground">SMSまたは認証アプリで追加認証</p>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-300">未設定</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-medium">ログイン中のデバイス</p>
                  <p className="text-sm text-muted-foreground">現在1台のデバイスでログイン中</p>
                </div>
                <Button variant="outline">管理する</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-xl border-red-200 bg-red-50/50">
                <div>
                  <p className="font-medium text-red-700">アカウント削除</p>
                  <p className="text-sm text-red-500">全てのデータが完全に削除されます</p>
                </div>
                <Button variant="destructive" size="sm">削除する</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
