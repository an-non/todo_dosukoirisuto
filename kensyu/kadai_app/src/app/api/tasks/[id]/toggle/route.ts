import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../../lib/supabaseClient';

type TaskRow = {
  id: string;
  title: string;
  notes: string | null;
  done: boolean;
  remind_at: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: existing, error: fetchErr } = await supabase
      .from('tasks')
      .select(
        'id, title, notes, done, remind_at, reminder_sent_at, created_at, updated_at'
      )
      .eq('id', params.id)
      .single();

    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const nextDone = !existing.done;

    const { data, error: updateErr } = await supabase
      .from('tasks')
      .update({ done: nextDone })
      .eq('id', params.id)
      .select(
        'id, title, notes, done, remind_at, reminder_sent_at, created_at, updated_at'
      )
      .single();

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
    return NextResponse.json({ task: data as TaskRow });
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

