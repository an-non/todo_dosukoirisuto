# 次に実装する未実装機能（現在の状態ベース）

## 現状把握
- `TaskManager` は SQLite の `/api/tasks` のみ動作。
- `TodoLinkGraph` と `/api/todo-links` は雛形（タスクを擬似的に並べてリンク生成、DB未実装）。
- 通知は `/api/notifications/todos` が `done=0` のタスクを通知候補にする暫定。
- Supabase Auth/RLS/DB schema 移行は未完了（当面は SQLite 維持でも「未実装」を潰す）。

## 実装ターゲット（優先度順）
1) **Todoリンク（task_links）を SQLite で永続化**
   - `kadai_app/src/lib/db.ts` に `task_links` テーブル追加
   - `/api/todo-links` に CRUD 実装（最低限）
   - `TodoLinkGraph` 側も「リンク追加/削除」を呼べるUIに拡張
   
2) **リンク作成のUIフローを完成**
   - `TaskManager` に「リンク追加」モード（タスクA選択→タスクB選択→保存）
   - `TodoLinkGraph` で表示が追随

3) **通知を remind_at に対応（DB永続）**
   - `tasks` に `remind_at`, `reminder_sent_at` を追加
   - `TaskManager` に `remind_at` 入力欄
   - `/api/notifications/todos` を `remind_at <= now()` かつ `reminder_sent_at is null` に合わせる
   - 通知送信後に `reminder_sent_at` 更新

## 後続（Supabase移行）
- SQLiteで上記が完成したら、次段で Supabase Auth/RLS/テーブル置換へ移行
- APIガード（認証必須）と最小権限を追加


