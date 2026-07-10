# チャット概要（要件・リクエスト・エラーログ・変更点・進捗）

## 1. 要件 / リクエスト
- Vercel に Next.js（`kadai_app`）をデプロイしたが `404` になる。
- エンドポイントやデプロイ設定の不整合を調査し、修正する。
- **「修正前に検討個所を明示」**すること。

## 2. 参照したリポジトリ前提
- Next.js(App Router) : `kadai_app/src/app/...`
- API ルート :
  - `kadai_app/src/app/api/tasks/route.ts`
  - `kadai_app/src/app/api/tasks/[id]/route.ts`
  - `kadai_app/src/app/api/tasks/[id]/toggle/route.ts`
- DB実装 : `kadai_app/src/lib/db.ts`（sqlite3）
- Supabase クライアント : `kadai_app/src/lib/supabaseClient.ts`

## 3. 検討個所（修正前に明示）
1) Vercel 設定 `vercel.json` の `rootDirectory` / build 対象のズレ
2) `outputDirectory` / `publicDir`（必要な場合）
3) ルーティング（`src/app/page.tsx` が存在するか等）

## 4. 主要なエラー（Vercel ログ）
### 4.1 /api/tasks が 500
ユーザー提示ログより：
- URL: `https://todo-dosukoirisuto-543c-r5hq81agf-an-nons-projects.vercel.app/api/tasks`
- エラー:
  - `ENOENT: no such file or directory, mkdir '/var/task/kensyu/kadai_app/data'`
- 発生原因推定:
  - `process.cwd()/data`（Vercel の `/var/task/.../data`）へ DB用ディレクトリを作ろうとして失敗。

## 5. 変更点（DBパスのサーバレス対応）
### 5.1 修正ファイル
- `c:/works/kensyu/kadai_app/src/lib/db.ts`

### 5.2 変更内容（意図）
- サーバレス環境で書き込み可能になりやすい場所へ DB を置く。
- Vercel環境変数が未設定でもフォールバックする。

### 5.3 実装の方針（最終形）
- DB保存先 `DATA_DIR` を以下優先順で決定:
  1. `process.env.DB_DIR`
  2. `process.env.NEXT_PUBLIC_DB_DIR`（互換）
  3. `'/tmp/data'`
  4. `process.cwd()/data`

- その上で `openDb()` 内で `fs.mkdirSync(DATA_DIR, { recursive: true })` を行う。

## 6. 途中で発生した問題と対応
### 6.1 TypeScript / ビルドの型エラー
- `??` と `||` の混在により、
  - `Right operand of ?? is unreachable because the left operand is never nullish.`
  のエラーが発生。
- これを解消するため、`'/tmp/data'` の後段は `??` ではなく `||` フォールバックに変更。

### 6.2（補足）Supabase 側について
- このチャットでは主に `sqlite3` の `/api/tasks` を動かす修正が中心。
- Supabase の `notes` 表示ページ追加も行った（後述）。

## 7. Supabase 表示ページ追加（参考）
### 7.1 追加ファイル
- `c:/works/kensyu/kadai_app/src/app/notes/page.tsx`

### 7.2 内容
- `src/lib/supabaseClient.ts` を利用して `notes` テーブルから `id, title` を取得して表示。
- `@/` エイリアスが tsconfig 未設定のため、import は相対パスに調整。

## 8. 進捗
- [x] Vercel 上の 500 原因（DBディレクトリ作成の ENOENT）を特定
- [x] `kadai_app/src/lib/db.ts` をサーバレス対応（DATA_DIR フォールバック）に修正
- [x] Supabase 表示ページ `app/notes/page.tsx` を追加（参考）
- [ ] Vercel の再デプロイ後、`/api/tasks` が 200 になる最終確認（/api/配下の疎通）

## 9. 次に必要な確認 / 作業
- Vercel 環境変数（任意だが推奨）
  - `DB_DIR=/tmp/data` を設定（未設定でも `/tmp/data` フォールバックする設計）
- 動作確認
  - フロントでタスク一覧が表示されるか
  - API疎通:
    - `/api/tasks`
    - `/api/tasks/{id}`
    - `/api/tasks/{id}/toggle`
- 追加: Supabase 表示（`/notes`）
  - `notes` テーブル作成とRLS/Policyが正しいことの確認

