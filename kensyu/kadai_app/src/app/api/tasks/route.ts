import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabaseClient';

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

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('tasks')
      .select(
        'id, title, notes, done, remind_at, reminder_sent_at, created_at, updated_at'
      )
      .order('done', { ascending: true })
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tasks: data as TaskRow[] });
  } catch {
    // Supabase未設定時はビルド/prerender中に落とさないため空配列を返す
    return NextResponse.json({ tasks: [] as TaskRow[] });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient();

    const body = (await req.json()) as {
      title?: string;
      notes?: string | null;
      remind_at?: string | null;
    };

    const title = (body.title ?? '').trim();
    if (!title || title.length < 1 || title.length > 80) {
      return NextResponse.json({ error: 'title must be 1..80 chars' }, { status: 400 });
    }

    const notes = typeof body.notes === 'string' ? body.notes : null;

    const remindAtRaw = body.remind_at ?? null;
    const remind_at =
      typeof remindAtRaw === 'string' && remindAtRaw.length ? remindAtRaw : null;

    if (remind_at != null) {
      const d = new Date(remind_at);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: 'remind_at must be an ISO datetime' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, notes, remind_at })
      .select(
        'id, title, notes, done, remind_at, reminder_sent_at, created_at, updated_at'
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: data as TaskRow }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

