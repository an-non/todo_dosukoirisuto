import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient();

    const body = (await req.json()) as {
      subscription?: any;
    };

    if (!body?.subscription) {
      return NextResponse.json({ error: 'subscription is required' }, { status: 400 });
    }

    const subscription = body.subscription;

    // upsert-like behavior: replace existing for this user.
    // (Simplest: delete then insert; unique constraint not guaranteed in schema.)
    await supabase.from('push_subscriptions').delete().eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? null);

    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert({ subscription })
      .select('id, subscription, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, subscription: data });
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

