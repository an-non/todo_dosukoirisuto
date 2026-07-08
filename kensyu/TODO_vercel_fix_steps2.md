# TODO_vercel_fix_steps2.md
- [ ] sqlite用API routeへ完全復元（本番supabase/localSQLite切替方針）
- [ ] ルート: `kadai_app/src/app/api/tasks/route.ts` / `[id]/route.ts` / `[id]/toggle/route.ts` を `kadai_app/src/lib/db.ts` の関数呼び出しに戻す
- [ ] ビルド通過確認（`npm run build`）
- [ ] 追加機能実装時にローカルSQLiteで疎通確認
- [ ] Vercelは追加機能実装完了後に別途最終確認

