import TaskManager from './components/TaskManager';

export default function Page() {
  return (
    <main>
      <div className="card">
        <h1>タスク管理</h1>
        <div className="meta">SQLiteで永続化（登録/一覧/更新/削除/完了切替）</div>
      </div>

      <div style={{ height: 14 }} />

      <TaskManager />
    </main>
  );
}

