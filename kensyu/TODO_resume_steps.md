# TODO resume steps（次の実装）

## 0. 状態確認（完了）
- Vercelで `DBとの連携完了` と表示されたため、ビルド/デプロイの最低要件は満たした。

## 1. 未実装機能の実装（次）
- [ ] task_links（Todoリンク）を SQLite で永続化（テーブル追加 + `/api/todo-links` を最低限CRUD）
- [ ] TaskManager に「リンク追加」UIフロー実装
- [ ] 通知を `remind_at` 対応（DB永続 + API + UI入力）

## 2. 検証
- [ ] `/api/todo-links` が 200 でリンクデータを返す
- [ ] リンク作成/削除がグラフへ反映
- [ ] `remind_at` 到達後に通知候補が出る（ローカル/本番どちらも）


