import { NextResponse } from 'next/server';
import { POST as sendPOST } from '../send/route';

// Alias route: /api/notifications/send-now -> /api/notifications/send
// (Next の route export 仕様上、直接再利用が難しいため、簡易に同ロジックを呼び出す)
export async function POST(req: Request) {
  // @ts-ignore
  return await sendPOST(req);
}

