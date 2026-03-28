# デプロイ手順

## 環境

| 環境 | ブランチ | URL |
|---|---|---|
| Production | `main` | TBD |
| Staging | `staging` | TBD |
| Development | `develop` | localhost:3000 |

## デプロイフロー

```
feature/* → develop → staging → main
```

1. `feature/*` ブランチで開発
2. PR → `develop` にマージ
3. `develop` → `staging` にPR（最終確認）
4. `staging` → `main` にPR（本番リリース）

## Vercel設定

- Production: `main` ブランチをデプロイ
- Preview: PR作成時に自動プレビュー
- 環境変数は Vercel Dashboard で設定

## Supabase

- Production / Staging でそれぞれ別プロジェクトを作成
- マイグレーションは `packages/db/migrations/` のSQLを順番に実行
