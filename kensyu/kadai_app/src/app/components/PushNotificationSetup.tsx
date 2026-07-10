'use client';

import { useEffect, useState } from 'react';

type PushSubscriptionLike = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushNotificationSetup() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (typeof window === 'undefined') return;

    async function run() {
      try {
        if (!('serviceWorker' in navigator)) {
          setError('Service Worker 未対応');
          return;
        }

        // VAPID public key は env からは取れないため、
        // プロトタイプでは window.__VAPID_PUBLIC_KEY などで注入する想定。
        const vapidPublicKey = (window as any).__VAPID_PUBLIC_KEY as string | undefined;
        if (!vapidPublicKey) {
          // キー未設定でも UIは動く（通知送信は dry-run）
          setError('VAPID public key 未設定（window.__VAPID_PUBLIC_KEY を設定してください）');
          return;
        }

        const reg = await navigator.serviceWorker.register('/sw.js');

        // Notification permission が必要
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setError('通知許可が拒否されました');
          return;
        }

        const sub = (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })) as PushSubscriptionLike;

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub }),
        });

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    }

    run();
  }, [ready]);

  if (error) {
    return <div className="meta" style={{ color: '#ffb3c0' }}>{error}</div>;
  }

  return null;
}

