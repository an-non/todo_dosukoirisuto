import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabaseClient';

type TaskLite = {
  id: string;
  title: string;
};

type TodoLink = {
  id: string;
  from_task_id: string;
  to_task_id: string;
  created_at: string;
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // prerender/export 時に env 未設定で落ちないようにする（空レスポンス）
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ links: [] as TodoLink[] });
  }

  const supabase = await getSupabaseServerClient();


  const [{ data: tasksData, error: tasksErr }, { data: linksData, error: linksErr }] = await Promise.all([
    supabase.from('tasks').select('id, title').order('updated_at', { ascending: false }).limit(200),
    supabase.from('task_links').select('id, from_task_id, to_task_id, created_at').order('created_at', { ascending: true }),
  ]);

  if (tasksErr) return NextResponse.json({ error: tasksErr.message }, { status: 500 });
  if (linksErr) return NextResponse.json({ error: linksErr.message }, { status: 500 });

  // フロント側の既存型互換のため response を { links } へ。
  // TodoLinkGraph が tasks を別APIで取得している前提のため links だけ返す。
  return NextResponse.json({ links: linksData as TodoLink[] });
}


