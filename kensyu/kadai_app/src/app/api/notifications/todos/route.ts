import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../lib/supabaseClient';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // prerender/export 時に env 未設定で落ちないようにする（空レスポンス）
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ notifications: [] as NotificationItem[] });
  }

  const supabase = await getSupabaseServerClient();


  // remind_at <= now() かつ reminder_sent_at が null のタスクを最大5件取得
  const nowIso = new Date().toISOString();

  const { data: dueTasks, error: fetchErr } = await supabase
    .from('tasks')
    .select('id, title, notes, remind_at, reminder_sent_at')
    .lte('remind_at', nowIso)
    .is('reminder_sent_at', null)
    .limit(5);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const notifications: NotificationItem[] = (dueTasks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    message: t.notes ? String(t.notes).slice(0, 200) : '通知があります',
  }));

  // 多重送信防止（ただし厳密には transaction が望ましいが、まずは reminder_sent_at を更新）
  const ids = (dueTasks ?? []).map((t) => t.id);
  if (ids.length) {
    await supabase
      .from('tasks')
      .update({ reminder_sent_at: nowIso })
      .in('id', ids);
  }

  return NextResponse.json({ notifications });
}


