# Vercel/localhost 404 Debug Notes

## 現状
- Next.js アプリは `kadai_app` 配下
- Vercel で 404 になっている件を調査中

## 変更ログ（今回）
- `kadai_app/tsconfig.json` に `compilerOptions.baseUrl = "./src"` を追加
- API route の supabase import を `@/lib/supabaseClient` に統一

## ローカル検証方針
- 新規インストールは行わない
- TypeScript/Next build が通ることを優先して確認
- その後、DB確認は既存の手段（SQLite）で行う

## ToDo
- 404の原因をVercelログ（デプロイビルド成果物/ルーティング）で確定
- 必要に応じて `vercel.json` の `outputDirectory` / `publicDir` を調整

