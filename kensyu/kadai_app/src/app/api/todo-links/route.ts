import { NextResponse } from 'next/server';

// TODOリンク機能（イメージツリー描画）用のAPIの土台。
// 現状プロジェクトは tasks のみで、todo_links / todos の追加が未実装。
// まずはAPIの設計だけ置いて、必要なDBスキーマ/型が決まり次第実装します。

import { listTasks } from '../../../lib/db';

type TodoLink = {
  id: number;
  from_todo_id: number;
  to_todo_id: number;
  created_at: string;
};


export async function GET() {
  // 簡易実装: タスクをID昇順に並べて、隣同士をリンクする（雛形ではなくデータを返す）
  const tasks = await listTasks();
  const sorted = [...tasks].sort((a, b) => a.id - b.id);
  const links = [] as Array<{ id: number; from_todo_id: number; to_todo_id: number; created_at: string }>;

  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i];
    const to = sorted[i + 1];
    links.push({
      id: i + 1,
      from_todo_id: from.id,
      to_todo_id: to.id,
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ links });
}

