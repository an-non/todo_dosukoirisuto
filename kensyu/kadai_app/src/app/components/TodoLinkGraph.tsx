'use client';

import { useEffect, useMemo, useState } from 'react';

type Todo = {
  id: number;
  title: string;
};

type TodoLink = {
  id: number;
  from_todo_id: number;
  to_todo_id: number;
  created_at: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

// 現状のTodoリンクはDB未実装のため、UIは"描画のみ"の雛形。
// 次に DB schema + API を実装した後、ここで links / todos を取得して描画する。
export default function TodoLinkGraph() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [links, setLinks] = useState<TodoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 仮: tasks が TODO 相当として扱われる前提（今後 todos API に置換）
        const tasks = await api<{ tasks: Todo[] }>('/api/tasks');
        setTodos(tasks.tasks);

        const graph = await api<{ links: TodoLink[] }>('/api/todo-links');
        setLinks(graph.links);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nodes = useMemo(() => {
    // 簡易配置（円形）。実装後に強制レイアウト/重力なども可能。
    const cx = 300;
    const cy = 200;
    const r = 140;
    const count = Math.max(1, todos.length);

    return todos.map((t, i) => {
      const angle = (Math.PI * 2 * i) / count;
      return {
        id: t.id,
        title: t.title,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    });
  }, [todos]);

  const nodeById = useMemo(() => {
    const m = new Map<number, { id: number; title: string; x: number; y: number }>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  if (loading) return <div className="meta">リンク描画準備中...</div>;
  if (error) return <div style={{ color: '#ffb3c0' }}>エラー: {error}</div>;

  return (
    <section className="card">
      <h2>イメージツリー（TODOリンク）</h2>
      <div className="meta">現段階はリンク取得の雛形。次に DB/API を実装して線が表示されます。</div>

      <div style={{ height: 12 }} />

      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10, overflowX: 'auto' }}>
        <svg width={600} height={400} style={{ display: 'block' }}>
          {/* edges */}
          {links.map((l) => {
            const a = nodeById.get(l.from_todo_id);
            const b = nodeById.get(l.to_todo_id);
            if (!a || !b) return null;
            return (
              <line
                key={l.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(93, 214, 255, 0.6)"
                strokeWidth={2}
              />
            );
          })}

          {/* nodes */}
          {nodes.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={18} fill="rgba(93, 214, 255, 0.16)" stroke="rgba(93, 214, 255, 0.55)" />
              <text x={n.x} y={n.y - 26} textAnchor="middle" fontSize={12} fill="var(--muted)">
                {n.id}
              </text>
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={13} fill="var(--text)">
                {n.title.length > 10 ? n.title.slice(0, 10) + '…' : n.title}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

