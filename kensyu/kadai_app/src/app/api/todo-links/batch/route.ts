import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../lib/supabaseClient';

export async function POST(req: Request) {
  // NOTE: env未設定で落ちる可能性があるため、supabaseClient側が例外を投げた場合は 401/空返却が望ましい。
  // 現状は既存挙動に合わせ、必要なら後で例外握りつぶしを追加します。
  const supabase = await getSupabaseServerClient();

  const body = (await req.json()) as {
    action?: 'create' | 'delete';

    // batch (preferred)
    links?: Array<{ from_task_id: string; to_task_id: string }>;
    link_ids?: string[];

    // backward-compatible (single)
    from_task_id?: string;
    to_task_id?: string;
    link_id?: string;
  };

  const action = body.action ?? 'create';

  if (action === 'create') {
    const links =
      body.links && Array.isArray(body.links)
        ? body.links
        : body.from_task_id && body.to_task_id
          ? [{ from_task_id: body.from_task_id, to_task_id: body.to_task_id }]
          : [];

    if (!links.length) {
      return NextResponse.json(
        { error: 'links (or from_task_id/to_task_id) are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('task_links')
      .insert(links)
      .select('id, from_task_id, to_task_id, created_at');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, links: data ?? [] });
  }

  if (action === 'delete') {
    const link_ids =
      body.link_ids && Array.isArray(body.link_ids)
        ? body.link_ids
        : body.link_id
          ? [body.link_id]
          : [];

    if (!link_ids.length) {
      return NextResponse.json({ error: 'link_ids (or link_id) are required' }, { status: 400 });
    }

    const { error } = await supabase.from('task_links').delete().in('id', link_ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, deleted_count: link_ids.length });
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}



