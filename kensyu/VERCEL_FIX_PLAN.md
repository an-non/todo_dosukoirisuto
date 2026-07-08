# Vercel 404 Fix Plan

## Information Gathered
- Next.js App root は `kadai_app`。
- `vercel.json` は以下の通り既に `outputDirectory` と `publicDir` を指定済み。
  - `outputDirectory: "kadai_app/.next"`
  - `publicDir: "kadai_app/public"`
  - ただし今回ユーザーの 404 は「Vercel のビルド/ルーティング成果物の解釈不整合」か「Next の rootDirectory 指定不整合」によって起きている可能性が高い。
- ローカルでは `/` と `/api/tasks` は 200 になっていることを確認済み。

## Plan
1. `vercel.json` を最小修正し、Vercel の `rootDirectory` を明示する（既に output/public はあるため追加で確実化）。
   - `rootDirectory: "kadai_app"` を追加
2. `kadai_app/tsconfig.json` の `baseUrl` に関する TS7 deprecation エラーを一旦回避する（動作自体の阻害ではないが、ビルドの安定性のため）。
   - `ignoreDeprecations: "6.0"` などを追加
3. Vercel デプロイ（再ビルド）して 404 が解消するか確認。

## Dependent Files to be edited
- `c:/works/kensyu/vercel.json`
- `c:/works/kensyu/kadai_app/tsconfig.json`

## Followup steps
- `vercel logs` で build がどこを root として扱ったか確認
- `/` および `/api/tasks` を確認

<ask_followup_question>
上記の方針（vercel.jsonにrootDirectory追加＋tsconfigのbaseUrl deprecation回避）でデプロイ再実行して良いですか？
</ask_followup_question>

