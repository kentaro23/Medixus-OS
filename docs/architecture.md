# Medixus OS アーキテクチャ概要

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 15+ (App Router) + Tailwind CSS + shadcn/ui |
| モバイル | React Native (Expo) — iOS/Android |
| バックエンド | Supabase (PostgreSQL + Auth + Realtime + Edge Functions) |
| AI | Claude API (Anthropic) |
| ビデオ通話 | Twilio or Agora SDK |
| 決済 | Stripe |
| インフラ | Vercel + Supabase Cloud + AWS S3 |

## モノレポ構成

```
apps/web       — Next.js Webアプリ
apps/mobile    — React Native モバイルアプリ（将来）
packages/db    — DBマイグレーション・シード
packages/ai    — AI関連ロジック（Claude API）
packages/shared — 共通型・定数・バリデーション
```

## ロール別アクセス

| ロール | パス | 説明 |
|---|---|---|
| 患者 | `/dashboard`, `/triage`, etc. | AI問診・予約・服薬管理 |
| 医師 | `/doctor/*` | 診察・処方・患者管理 |
| クリニック管理者 | `/clinic/*` | SaaS運用・スタッフ管理 |
| Medixus管理者 | `/admin/*` | KPI・クリニック管理・設定 |
