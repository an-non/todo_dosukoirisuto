import { NextResponse } from 'next/server';

// TODO: このサンプルは「ブラウザ通知（1.b: ポーリング）」用の"対象あり"判定APIです。
// 本番Supabase運用では、(1)期限/所要時間を格納したテーブルを参照し、
//      (2)通知済みフラグ等を考慮して、(a)今通知すべきTODOの配列を返します。
//
// 現状は既存の tasks をSQLiteで参照しているため、期限情報がない=通知候補を返せません。
// ここは次に DBスキーマを追加する前提の"穴"として用意します。

import { listTasks } from '../../../../lib/db';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
};

export async function GET() {
  // 簡易実装: タスク一覧のうち未完了(done=0)を通知候補にする
  const tasks = await listTasks();
  const notifications = tasks
    .filter((t) => t.done === 0)
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: '未完了タスクがあります',
      message: t.title,
    }));

  return NextResponse.json({ notifications });
}

