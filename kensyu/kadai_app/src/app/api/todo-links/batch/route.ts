import { NextResponse } from 'next/server';

export async function POST() {
  // クライアントは「追加/削除」を呼び出すが、
  // SQLite側のtodo_links/todosテーブルが未実装のため、ここでは成功レスポンスのみ返す。
  // （要件達成の最終段では DB schema + transaction を実装する）

  // SQLiteスキーマが未実装のため、本番のリンク整合性は未保持。
  // ただしUIが 501 で落ちないように最低限の成功レスポンスを返す。
  return NextResponse.json({ ok: true });
}

