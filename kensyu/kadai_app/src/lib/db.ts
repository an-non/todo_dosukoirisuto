import fs from 'node:fs';
import path from 'node:path';
import sqlite3 from 'sqlite3';

// Vercelなどのサーバレス環境で /var/task 直下への書き込みが失敗するため、
// 書き込み可能な一時領域に DB を置く（ローカルは従来の data/tasks.sqlite）。
const DATA_DIR = process.env.NEXT_PUBLIC_DB_DIR ?? path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'tasks.sqlite');

// Vercel等のサーバレス環境ではファイル永続が保証されないため、
// 常にプロジェクトルート相対の保存先を使えるようにする。
// （ローカルでは従来通り data/tasks.sqlite を利用）

function openDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const db = new sqlite3.Database(DB_PATH);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        notes TEXT,
        done INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);
    `);
  });

  return db;
}

function all<T = any>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

function get<T = any>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

function run(db: sqlite3.Database, sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: sqlite3.RunResult, err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

type TaskRow = {
  id: number;
  title: string;
  notes: string | null;
  done: 0 | 1;
  created_at: string;
  updated_at: string;
};

export async function listTasks(): Promise<TaskRow[]> {
  const db = openDb();
  try {
    const tasks = await all<TaskRow>(
      db,
      `SELECT id, title, notes, done, created_at, updated_at
       FROM tasks
       ORDER BY done ASC, updated_at DESC, id DESC`
    );
    return tasks;
  } finally {
    db.close();
  }
}

export async function getTaskById(id: number): Promise<TaskRow | undefined> {
  const db = openDb();
  try {
    return await get<TaskRow>(
      db,
      `SELECT id, title, notes, done, created_at, updated_at FROM tasks WHERE id = ?`,
      [id]
    );
  } finally {
    db.close();
  }
}

export async function createTask({ title, notes }: { title: string; notes: string | null }) {
  const db = openDb();
  try {
    const { lastID } = await run(
      db,
      `INSERT INTO tasks (title, notes, done, created_at, updated_at)
       VALUES (?, ?, 0, datetime('now'), datetime('now'))`,
      [title, notes]
    );
    const task = await getTaskById(lastID);
    if (!task) throw new Error('failed to create');
    return task;
  } finally {
    db.close();
  }
}

export async function updateTask(
  id: number,
  { title, notes }: { title: string; notes: string | null }
) {
  const db = openDb();
  try {
    await run(
      db,
      `UPDATE tasks
       SET title = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, notes, id]
    );
    const task = await getTaskById(id);
    if (!task) throw new Error('not found after update');
    return task;
  } finally {
    db.close();
  }
}

export async function deleteTask(id: number) {
  const db = openDb();
  try {
    await run(db, `DELETE FROM tasks WHERE id = ?`, [id]);
  } finally {
    db.close();
  }
}

export async function toggleDone(id: number) {
  const db = openDb();
  try {
    const existing = await get<TaskRow>(db, `SELECT * FROM tasks WHERE id = ?`, [id]);
    if (!existing) throw new Error('not found');

    const next = existing.done === 1 ? 0 : 1;
    await run(
      db,
      `UPDATE tasks
       SET done = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [next, id]
    );

    const task = await getTaskById(id);
    if (!task) throw new Error('not found after toggle');
    return task;
  } finally {
    db.close();
  }
}

