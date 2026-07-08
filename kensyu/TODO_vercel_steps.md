# TODO_vercel_steps

- [x] 現状把握（done）: ローカルは next build/start 成功、Vercelログ上は build完了するが outputs準備がない/不整合の可能性
- [x] 修正方針確定: vercel.json に Next成果物の出力先（outputDirectory / publicDir相当）を追加
- [x] `vercel.json` を編集（rootDirectoryは削除し、install/build/output/public を kadai_app に合わせた）

- [ ] Vercel 再デプロイ（現状公開URLの動作確認）

- [ ] Vercelログで Deploying outputs の結果と静的成果物の準備状況を確認
- [ ] `GET /` が 200、`/api/tasks` が 200 になるか確認

- [ ] ブラッシュアップ要件計画確定（Supabase Auth + reminders + task_links + RLS）
- [ ] （実装）Supabase導入（環境変数/接続/認証）
- [ ] （実装）DBスキーマ移行（tasks/task_links/push_subscriptions + RLS）
- [ ] （実装）APIガード（認証必須 + 自分のデータだけアクセス）
- [ ] （実装）フロント拡張（remind_at入力/UI）
- [ ] （実装）リンク追加/UI（task_links作成/削除）
- [ ] （実装）Web Push購読保存 + 通知送信（remind_at到達）
- [ ] （検証）セキュリティ（他人の操作不可）、動作（通知/リンク/削除カスケード）



