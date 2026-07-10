import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../lib/supabaseClient';

// NOTE:
// このプロジェクトの依存関係上、web-push を追加できない場合があるため、
// まずは "通知送信API" の形（due判定＋多重送信防止更新）までを実装します。
// 将来的に web-push（VAPID）を入れられる環境になったら sendNotification 部分を差し替えます。

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();

    const nowIso = new Date().toISOString();

    const { data: dueTasks, error: dueErr } = await supabase
      .from('tasks')
      .select('id, title, notes, remind_at, reminder_sent_at')
      .lte('remind_at', nowIso)
      .is('reminder_sent_at', null)
      .limit(20);

    if (dueErr) return NextResponse.json({ error: dueErr.message }, { status: 500 });

    const tasks = dueTasks ?? [];
    if (!tasks.length) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    // ここでは実送信せず、reminder_sent_at 更新のみ行う（多重送信防止の核）。
    // 実送信を入れる場合は、この行の前後で web-push を差し込みます。
    const ids = tasks.map((t) => t.id);

    await supabase
      .from('tasks')
      .update({ reminder_sent_at: nowIso })
      .in('id', ids);

    return NextResponse.json({ ok: true, sent: ids.length, dryRun: true });
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

