# TODO_resume_steps2.md

## 更新履歴（自動整理）
- 2026-07-09: sqlite API → Supabase API 置換を実施（tasks/toggle/todo-links/batch/notifications）
- 2026-07-09: TodoLinkGraph の uuid/string 型ズレを吸収
- 2026-07-09: TaskManager を remind_at 入力込みで復元する（完了）


## TODO_vercel_steps.md との対応
- [ ] （実装）DBスキーマ移行（tasks/task_links/push_subscriptions + RLS）
- [ ] （実装）APIガード（認証必須 + 自分のデータだけアクセス）
- [ ] （実装）フロント拡張（remind_at入力/UI）← TaskManager 復元中
- [ ] （実装）リンク追加/UI（task_links作成/削除）
- [ ] （実装）Web Push購読保存 + 通知送信（remind_at到達）
- [ ] （検証）セキュリティ（他人の操作不可）、動作（通知/リンク/削除カスケード）

