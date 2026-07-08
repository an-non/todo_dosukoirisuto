import { NextResponse } from 'next/server';
import { toggleDone } from '../../../../../lib/db';
// sqlite/db.ts exists at: src/lib/db.ts


export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    const task = await toggleDone(id);
    return NextResponse.json({ task });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg === 'not found' || msg === 'not found after toggle') {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}


