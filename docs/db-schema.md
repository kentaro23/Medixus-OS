# Medixus OS DB設計書

## 命名規則
- snake_case
- 複数形（users, appointments, prescriptions）
- 中間テーブルは「table1_table2」形式

## テーブル一覧

### 認証・プロフィール
- `profiles` — auth.usersの拡張（ロール・氏名・住所等）
- `patient_insurance` — 保険証情報
- `patient_medical_history` — 既往歴・アレルギー・服薬

### クリニック
- `clinics` — クリニック情報
- `doctors` — 医師情報（免許番号・専門科）
- `staff` — クリニック↔ユーザー中間テーブル

### 診療
- `appointments` — 予約
- `video_sessions` — ビデオ通話セッション
- `consents` — 同意記録
- `medical_records` — 電子カルテ（SOAP形式）
- `diagnoses` — 傷病名（ICD-10）

### AI
- `ai_consultations` — AI問診セッション
- `risk_scores` — リスクスコア

### 処方・検査
- `prescriptions` — 処方箋
- `prescription_items` — 処方明細
- `lab_orders` — 検査オーダー

### バイタル・健診
- `vital_records` — バイタルデータ
- `health_checkups` — 健診データ

### 服薬・通知
- `medication_logs` — 服薬ログ
- `notifications` — 通知
- `messages` — メッセージ

### 提携
- `partner_pharmacies` — 提携薬局
- `partner_labs` — 提携検査機関

### セキュリティ
- `audit_logs` — 監査ログ

## RLSポリシー

全テーブルにRow Level Securityを適用。
詳細は `packages/db/migrations/` のSQLファイルを参照。
