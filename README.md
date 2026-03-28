# Medixus OS

> 「具合が悪くなってから受診する」を終わらせる — AI×オンライン診療×予防医療プラットフォーム

## 技術スタック

- **Web**: Next.js 15+ (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI**: Claude API (Anthropic)
- **Mobile**: React Native (Expo) — 将来

## モノレポ構成

```
apps/web        → Next.js Webアプリ
apps/mobile     → React Nativeモバイル（将来）
packages/db     → DBマイグレーション・シード
packages/ai     → AI問診・リスクスコア・処方提案
packages/shared → 共通型・定数・バリデーション
```

## セットアップ

```bash
npm install
cp apps/web/.env.local.example apps/web/.env.local  # 環境変数を設定
npm run dev
```

## ブランチ戦略

```
main     ← Production（直接pushしない）
staging  ← ステージング確認用
develop  ← 日常の開発ブランチ
  └── feature/* ← 機能ブランチ
```

## ドキュメント

- [アーキテクチャ概要](docs/architecture.md)
- [DB設計書](docs/db-schema.md)
- [法的制約](docs/legal-constraints.md)
- [デプロイ手順](docs/deployment.md)
- [API仕様](docs/api-reference.md)
