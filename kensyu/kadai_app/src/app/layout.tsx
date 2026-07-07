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
      </body>
    </html>
  );
}

