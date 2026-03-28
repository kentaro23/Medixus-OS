# API リファレンス

## 認証

Supabase Authを使用。

| エンドポイント | 説明 |
|---|---|
| `POST /auth/login` | メール+パスワードログイン |
| `POST /auth/register` | 新規登録 |
| `POST /auth/forgot-password` | パスワードリセット |
| `GET /auth/callback` | OAuth / メール確認コールバック |

## データアクセス

Supabase Client SDKで直接アクセス（RLSで保護）。

## Edge Functions

将来的にSupabase Edge Functionsで以下を実装予定:
- AI問診セッション管理
- 処方箋の電子署名
- ビデオ通話ルーム作成
- Webhook受信（薬局・検査機関）
