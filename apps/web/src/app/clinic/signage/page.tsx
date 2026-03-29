"use client";

import { useState } from "react";
import {
  Monitor,
  Plus,
  Trash2,
  Eye,
  Save,
  GripVertical,
  Image,
  Megaphone,
  Heart,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContentItem {
  id: string;
  content_type: "announcement" | "health_info" | "promotion";
  title: string;
  body: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Megaphone; color: string }> = {
  announcement: { label: "お知らせ", icon: Megaphone, color: "text-blue-700 bg-blue-100" },
  health_info: { label: "健康情報", icon: Heart, color: "text-green-700 bg-green-100" },
  promotion: { label: "プロモーション", icon: Tag, color: "text-purple-700 bg-purple-100" },
};

const DEMO_CONTENTS: ContentItem[] = [
  { id: "c1", content_type: "announcement", title: "本日の午後は休診です", body: "午前の診察は通常通り行います。", display_order: 1, is_active: true },
  { id: "c2", content_type: "announcement", title: "インフルエンザ予防接種のご案内", body: "10月1日より接種開始。予約受付中です。", display_order: 2, is_active: true },
  { id: "c3", content_type: "health_info", title: "花粉症の季節です", body: "早めの対策が効果的です。マスク着用・帰宅時の洗顔をお勧めします。", display_order: 3, is_active: true },
  { id: "c4", content_type: "health_info", title: "正しい手洗いの方法", body: "石けんをつけて20秒以上かけて丁寧に洗いましょう。", display_order: 4, is_active: true },
  { id: "c5", content_type: "health_info", title: "高血圧の予防", body: "塩分を1日6g未満に。野菜・果物を積極的に摂取しましょう。", display_order: 5, is_active: true },
];

export default function SignageManagementPage() {
  const [contents, setContents] = useState(DEMO_CONTENTS);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [saved, setSaved] = useState(false);

  function addContent() {
    setEditing({
      id: "new-" + Date.now(),
      content_type: "announcement",
      title: "",
      body: "",
      display_order: contents.length + 1,
      is_active: true,
    });
  }

  function saveContent() {
    if (!editing) return;
    setContents((prev) => {
      const idx = prev.findIndex((c) => c.id === editing.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = editing;
        return updated;
      }
      return [...prev, editing];
    });
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function removeContent(id: string) {
    setContents((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleActive(id: string) {
    setContents((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !c.is_active } : c));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">デジタルサイネージ管理</h1>
          <p className="text-sm text-muted-foreground">待合室モニターに表示するコンテンツを管理します</p>
        </div>
        <div className="flex gap-2">
          <a href="/signage/demo-clinic" target="_blank" rel="noopener noreferrer">
            <Button variant="outline"><ExternalLink size={16} className="mr-2" /> プレビュー</Button>
          </a>
          <Button onClick={addContent} className="bg-cyan-600 hover:bg-cyan-700"><Plus size={16} className="mr-2" /> コンテンツ追加</Button>
        </div>
      </div>

      {editing && (
        <Card className="border-cyan-300 bg-cyan-50/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-medium">
              {contents.find((c) => c.id === editing.id) ? "コンテンツ編集" : "新規コンテンツ"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>タイプ</Label>
                <select
                  value={editing.content_type}
                  onChange={(e) => setEditing({ ...editing, content_type: e.target.value as ContentItem["content_type"] })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                >
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                </select>
              </div>
              <div>
                <Label>タイトル</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>本文</Label>
              <textarea
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                className="w-full border rounded-lg p-3 text-sm h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>表示開始日</Label>
                <Input type="date" value={editing.starts_at || ""} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })} />
              </div>
              <div>
                <Label>表示終了日</Label>
                <Input type="date" value={editing.ends_at || ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveContent} className="bg-cyan-600 hover:bg-cyan-700"><Save size={16} className="mr-1" /> 保存</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>キャンセル</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {saved && (
        <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm flex items-center gap-2">
          <Save size={14} /> 保存しました
        </div>
      )}

      <div className="space-y-2">
        {contents.map((item) => {
          const cfg = TYPE_CONFIG[item.content_type];
          return (
            <Card key={item.id} className={item.is_active ? "" : "opacity-50"}>
              <CardContent className="p-4 flex items-center gap-4">
                <GripVertical size={16} className="text-gray-400 cursor-grab shrink-0" />
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.content_type === "announcement" ? "#dbeafe" : item.content_type === "health_info" ? "#dcfce7" : "#f3e8ff" }}>
                  <cfg.icon size={16} className={cfg.color.split(" ")[0]} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{item.title}</span>
                    <Badge className={`${cfg.color} text-xs`}>{cfg.label}</Badge>
                    {!item.is_active && <Badge variant="secondary" className="text-xs">非表示</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.body}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(item)} className="text-xs">編集</Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(item.id)} className="text-xs">
                    {item.is_active ? "非表示" : "表示"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeContent(item.id)}>
                    <Trash2 size={14} className="text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
