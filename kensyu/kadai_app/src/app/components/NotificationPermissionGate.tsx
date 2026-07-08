'use client';

import { useEffect, useState } from 'react';

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

export default function NotificationPermissionGate() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPermission(Notification.permission);
    setChecked(true);
  }, []);

  async function requestPermission() {
    // ブラウザ通知は必ずユーザー操作（クリック）起点が必要。
    const p = await Notification.requestPermission();
    setPermission(p);
    try {
      await api('/api/notifications/permission', { method: 'POST' });
    } catch {
      // ここは通知許可自体には影響しないため握りつぶす
    }
  }

  if (!checked) return null;

  if (typeof window !== 'undefined' && !('Notification' in window)) {
    return <div className="meta">このブラウザは通知に対応していません。</div>;
  }

  if (permission === 'granted') {
    return <div className="meta">通知は許可されています。</div>;
  }

  return (
    <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span>期限通知を表示するには、通知の許可が必要です。</span>
      <button className="primary small" onClick={requestPermission}>
        通知を許可
      </button>
    </div>
  );
}

