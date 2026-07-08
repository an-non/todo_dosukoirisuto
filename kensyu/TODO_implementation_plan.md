# Implementation Plan (Supabase + Reminders + Task Graph)

## Goal
Vercel公開で動作するタスク管理アプリを、
- 認証あり（Supabase Auth）
- DB永続（Supabase Postgres）
- 通知（remind_at日時指定→Web Push）
- タスクの並行グラフ表示（task_links）
- 改竄防止（RLS + 入力検証 + 最小権限）
へブラッシュアップする。

---

## 1. Project scope (最小移行)
### 1.1 DBテーブル（プロトタイプ用）
- `tasks`
  - `id` (uuid)
  - `user_id` (uuid, FK to auth.users)
  - `title` (text, length 限定)
  - `notes` (text, nullable, length 限定)
  - `done` (boolean or int)
  - `created_at`, `updated_at`
  - `remind_at` (timestamptz nullable) ← 通知期限（日時入力）
  - `reminder_sent_at` (timestamptz nullable) ← 多重送信防止

- `task_links`（並行グラフのエッジ）
  - `id` (uuid)
  - `user_id` (uuid)
  - `from_task_id` (FK → tasks.id)
  - `to_task_id` (FK → tasks.id)
  - `relation_type` (text nullable / prototypeでは null 固定でも可)
  - `created_at`
  - **ON DELETE CASCADE**（片方削除でリンク自動削除）
  - 重複リンクの扱い：prototypeでは重複許容→後で正規化

- `push_subscriptions`
  - `id` (uuid)
  - `user_id` (uuid)
  - `subscription` (jsonb)
  - `created_at`, `updated_at`

### 1.2 RLS方針（改竄防止の核）
- `tasks`: `user_id = auth.uid()` の行だけ CRUD 許可
- `task_links`: `user_id = auth.uid()` の行だけ CRUD 許可（from/to はAPI側でも検証、後でDB制約強化）
- `push_subscriptions`: `user_id = auth.uid()` の行だけ CRUD 許可

### 1.3 APIガード（サーバ側のみDB操作）
- 全 API route で Supabase Auth を確認
- `GET /api/tasks` は自分の tasks のみ
- `POST/PUT/DELETE/toggle` は自分の tasks のみ
- linksのAPIも同様

### 1.4 入力検証（スキーマ検証）
- title: 必須 + 長さ上限（例 1..80）
- notes: nullable + 長さ上限（例 0..1000）
- remind_at: 形式（ISO日時）の検証、null許容
- id: uuid形式検証（or int変換）

---

## 2. Notifications (Web Push) 最小実装
### 2.1 フロー
1) ブラウザで Push 許可
2) `subscription` を取得して `push_subscriptions` に保存
3) `remind_at` 到達時に対象 tasks を取得
4) `push_subscriptions` に Web Push を送信
5) `reminder_sent_at` を更新（多重送信防止）

### 2.2 「常時起動」要件の扱い
- Vercelサーバレス前提なので、
  - cron相当（定期実行）＋
  - フォールバックとしてユーザーアクセス時の未送信分送信

### 2.3 prototype仕様
- 通知の送信対象：`remind_at <= now()` かつ `reminder_sent_at is null`
- 通知本文：task.title + notes（一部）

---

## 3. Task Graph (イメージツリー) 最小実装
### 3.1 UI方針
- 既存の TaskManager に「リンク追加」モードを追加
- 選択手順：
  - タスクAを選ぶ → タスクBを選ぶ → リンク作成
- 表示：
  - 並行（無方向）グラフとして線で表示（react-flow等を想定）

### 3.2 表示データ
- nodes = tasks
- edges = task_links（from/to）

---

## 4. 測定/テスト観点
- Vercel公開で `/` が 200 になる
- `GET /api/tasks` が 401/200 を適切に返す（認証あり前提）
- タスクCRUDが自分のみに制限されている（RLSで担保）
- 課題：リンク作成/削除が期待通りに反映される（cascade含む）
- 通知：remind_at到達で通知が送られる（多重送信しない）

---

## 5. Execution order
1) Supabaseプロジェクト作成 & 環境変数セット
2) DBスキーマ作成 + RLS設定
3) API route に Auth + 入力検証 + DB接続切替
4) Frontのauthフロー追加（サインイン、ユーザー取得）
5) tasks拡張（remind_at入力UI）
6) task_links UI + 表示
7) Push subscription保存 + 通知送信処理
8) E2E確認

