'use client';

import { useEffect, useRef, useState } from 'react';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
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

export default function BrowserTodoNotifier() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);
  const lastNotifiedAtRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    // 1.b: ポーリング実装
    // 通知APIは /api/notifications/todos が「今通知すべきTODO」を返す想定。
    if (typeof window === 'undefined') return;
    if (permission !== 'granted') return;

    let timer: number | undefined;
    let cancelled = false;

    async function tick() {
      if (cancelled) return;

      try {
        const data = await api<{ notifications: NotificationItem[] }>('/api/notifications/todos');
        if (!data.notifications.length) return;

        // 多重通知を軽減：同一バッチを短時間で連発しない
        const now = Date.now();
        if (now - lastNotifiedAtRef.current < 30_000) return;

        lastNotifiedAtRef.current = now;
        setEnabled(true);

        for (const n of data.notifications) {
          new Notification(n.title, { body: n.message });
        }
      } catch {
        // 通知失敗は握りつぶし（UI/本体の動作を壊さない）
      }
    }

    // 即時実行 + 周期実行
    tick();
    timer = window.setInterval(tick, 60_000);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [permission]);

  return null;
}

