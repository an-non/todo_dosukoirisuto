import { NextResponse } from 'next/server';

// ブラウザ通知はクライアントで Permission を要求するため、
// このAPIは "通知許可UIを出す" のためのフックとして用意するだけです。
export async function POST() {
  return NextResponse.json({ ok: true });
}

