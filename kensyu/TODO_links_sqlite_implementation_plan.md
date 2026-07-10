# task_links(SQLite永続化)実装計画

## 目的
- `TodoLinkGraph` が表示するリンクデータを、SQLiteに永続化する
- `GET /api/todo-links` がリンク一覧を返す（擬似生成から実データへ）
- `POST /api/todo-links/batch`（将来）や `POST/DELETE`（必要最小）でリンク追加/削除できる状態にする

## 対象
- `kadai_app/src/lib/db.ts`
  - `task_links` テーブル作成
  - 関数：`listTaskLinks` / `createTaskLink` / `deleteTaskLink`
- `kadai_app/src/app/api/todo-links/route.ts`
  - `GET` を `listTaskLinks` から返す
  - （必要なら）`POST`/`DELETE` も追加

## 実装手順
1. `db.ts` に `task_links` テーブル（from_task_id/to_task_id, created_at）追加
2. `db.ts` にリンク操作関数を追加
3. `api/todo-links` の GET 実装を置換
4. `vercel build`（または `npm run build`）で型/ビルド通過確認

## 成功条件
- `/api/todo-links` が 200 を返し、tasks がある場合に edges が返る
- タスクを追加してもリンクが表示される（少なくとも GETが壊れない）


