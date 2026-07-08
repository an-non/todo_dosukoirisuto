import { NextResponse } from 'next/server';
import { deleteTask, getTaskById, updateTask } from '../../../../lib/db';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const existing = await getTaskById(id);
  if (!existing) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const body = (await req.json()) as { title?: string; notes?: string | null };
  const title = (body.title ?? '').trim();
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  const notes = typeof body.notes === 'string' ? body.notes : null;

  const task = await updateTask(id, { title, notes });
  return NextResponse.json({ task });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  await deleteTask(id);
  return NextResponse.json({ ok: true });
}


