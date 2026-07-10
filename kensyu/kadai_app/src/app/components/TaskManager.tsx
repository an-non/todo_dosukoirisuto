'use client';

import { useEffect, useMemo, useState } from 'react';
import BrowserTodoNotifier from './BrowserTodoNotifier';
import NotificationPermissionGate from './NotificationPermissionGate';
import PushNotificationSetup from './PushNotificationSetup';


type Task = {
  id: string;
  title: string;
  notes: string | null;
  done: boolean;
  remind_at: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
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

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [remindAt, setRemindAt] = useState(''); // datetime-local string

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // --- todo_links: link add mode ---
  const [linkFromId, setLinkFromId] = useState<string | null>(null);
  const [linkToId, setLinkToId] = useState<string | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);


  const doneCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);
  const totalCount = tasks.length;

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ tasks: Task[] }>('/api/tasks');
      setTasks(data.tasks);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    const t = title.trim();
    if (!t) return;

    try {
      const remind_at = remindAt.trim() ? remindAt : null;

      await api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: t, notes: notes.trim() || null, remind_at }),
      });

      setTitle('');
      setNotes('');
      setRemindAt('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditNotes(task.notes ?? '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditNotes('');
  }

  async function handleUpdate() {
    if (editingId == null) return;

    const t = editTitle.trim();
    if (!t) return;

    try {
      await api(`/api/tasks/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: t,
          notes: editNotes.trim() || null,
          // remind_at を更新時に消さない（通知日時維持）
          remind_at: tasks.find((x) => x.id === editingId)?.remind_at ?? undefined,
        }),
      });
      cancelEdit();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function toggleDone(task: Task) {
    try {
      await api(`/api/tasks/${task.id}/toggle`, { method: 'POST' });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function remove(taskId: string) {
    if (!confirm('このタスクを削除しますか？')) return;

    try {
      await api(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (editingId === taskId) cancelEdit();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <NotificationPermissionGate />
      <PushNotificationSetup />
      <BrowserTodoNotifier />

      <div className="grid2">
        <section className="card">
          <h2>タスクの追加</h2>

          <div className="row" style={{ marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="badge" style={{ marginBottom: 6 }}>
                <input className="checkbox" type="checkbox" checked={true} readOnly />
                CREATE
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タスク名（必須）"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>
          </div>

          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="メモ（任意）" />

          <div style={{ height: 10 }} />

          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
              />
            </div>
          </div>
          <div className="meta" style={{ marginTop: 6 }}>
            通知日時（任意）
          </div>

          <div style={{ height: 10 }} />

          <div className="row">
            <button className="primary" onClick={handleCreate}>
              追加
            </button>
            <div className="meta">
              {totalCount} 件中 {doneCount} 件 完了
            </div>
          </div>

          {error ? <div style={{ marginTop: 12, color: '#ffb3c0' }}>エラー: {error}</div> : null}
        </section>

        <section className="card">
          <h2>一覧（READ / UPDATE / DELETE / 完了切替）</h2>

          {loading ? <div className="meta">読み込み中...</div> : null}
          {!loading && tasks.length === 0 ? <div className="meta">タスクはありません。</div> : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.map((t) => {
              const isEditing = editingId === t.id;
              const isLinkFrom = linkFromId === t.id;
              const isLinkTo = linkToId === t.id;

              return (
                <div key={t.id} className={`task ${t.done ? 'taskDone' : ''}`}>

                  <div>
                    {isEditing ? (
                      <>
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        <div style={{ height: 8 }} />
                        <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                        <div style={{ height: 10 }} />
                        <div className="row">
                          <button className="primary small" onClick={handleUpdate}>
                            更新
                          </button>
                          <button className="small" onClick={cancelEdit}>
                            キャンセル
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>{t.title}</div>
                        {t.notes ? <div className="meta">{t.notes}</div> : null}
                        <div className="meta">更新: {new Date(t.updated_at).toLocaleString()}</div>

                        <div style={{ height: 10 }} />
                        <div className="row">
                          <label className="badge" style={{ cursor: 'pointer' }}>
                            <input className="checkbox" type="checkbox" checked={t.done} onChange={() => toggleDone(t)} />
                            {t.done ? '完了' : '未完了'}
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  {!isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      <button className="small" onClick={() => startEdit(t)}>
                        編集
                      </button>

                      {/* todo_links: link selection */}
                      <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <button
                          className={isLinkFrom ? 'small primary' : 'small'}
                          onClick={() => {
                            if (linkToId === t.id) return;
                            setLinkFromId(t.id);
                          }}
                        >
                          A
                        </button>
                        <button
                          className={isLinkTo ? 'small primary' : 'small'}
                          onClick={() => {
                            if (linkFromId === t.id) return;
                            setLinkToId(t.id);
                          }}
                        >
                          B
                        </button>
                      </div>

                      <button className="small" disabled={linkBusy || !linkFromId || !linkToId} onClick={async () => {
                        if (!linkFromId || !linkToId) return;
                        if (linkFromId === linkToId) return;
                        setLinkBusy(true);
                        setError(null);
                        try {
                          await api('/api/todo-links/batch', {
                            method: 'POST',
                            body: JSON.stringify({
                              action: 'create',
                              links: [{ from_task_id: linkFromId, to_task_id: linkToId }],
                            }),
                          });
                          setLinkFromId(null);
                          setLinkToId(null);
                          await refresh();
                        } catch (e) {
                          setError(e instanceof Error ? e.message : String(e));
                        } finally {
                          setLinkBusy(false);
                        }
                      }}>
                        リンク作成
                      </button>

                      <button
                        className="small danger"
                        onClick={() => remove(t.id)}
                      >
                        削除
                      </button>
                    </div>
                  ) : null}

                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

