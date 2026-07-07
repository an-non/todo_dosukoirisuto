# TODO
- [x] リポジトリ構成確認（Next.jsがVercel向けにデプロイ可能か、必要な設定ファイルが揃っているか）
- [x] Vercelデプロイ前提の最小変更方針を確定（コード改変は避け、必要ならpackage.json/ビルド設定のみ）
- [x] `kadai_app` 配下の Next.js 設定（`package.json` / `next.config.mjs` など）を確認
- [x] sqlite3 のDB保存先がVercelで成立するよう最小修正（`kadai_app/src/lib/db.ts` のみ）
- [x] Vercel手順（Root Directory の問題切り分け）
- [x] ローカルビルド成功確認（`kadai_app`）
- [x] API `/api/tasks` の疎通確認（ローカル）

- [ ] Vercelデプロイ再実行（vercel.json による build/install/rootDirectory 固定）
- [ ] デプロイ後の動作確認（API `/api/tasks` と `/api/tasks/[id]/toggle`）

