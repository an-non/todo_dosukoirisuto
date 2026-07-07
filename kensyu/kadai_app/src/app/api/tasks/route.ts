import { NextResponse } from 'next/server';
import { listTasks, createTask } from '../../../lib/db';

export async function GET() {
  const tasks = await listTasks();
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { title?: string; notes?: string | null };
  const title = (body.title ?? '').trim();
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  const notes = typeof body.notes === 'string' ? body.notes : null;
  const task = await createTask({ title, notes });
  return NextResponse.json({ task }, { status: 201 });
}

