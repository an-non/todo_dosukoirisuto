import type { Metadata } from 'next';
import './globals.css';




export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'SQLite-backed task management app',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <div className="container">{children}</div>
        <script
          // VAPID public key を購読作成側に注入する（PushNotificationSetup が window.__VAPID_PUBLIC_KEY を参照）
          dangerouslySetInnerHTML={{
            __html: `window.__VAPID_PUBLIC_KEY = ${JSON.stringify(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
            )};`,
          }}
        />

      </body>
    </html>
  );
}

