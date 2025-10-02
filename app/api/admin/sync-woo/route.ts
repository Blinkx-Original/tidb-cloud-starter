import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/sync/auth';
import { runWooSync, getWooStatus } from '@/lib/sync/woo';
import { withSyncLock, isSyncRunning } from '@/lib/sync/lock';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  const status = await getWooStatus();
  return NextResponse.json({ status, running: isSyncRunning('woo') });
}

export async function POST(req: Request) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  try {
    const summary = await withSyncLock('woo', () => runWooSync({ triggeredBy: 'manual' }));
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    const status = /already running/i.test(message) ? 409 : 500;
    if (status === 500) {
      console.error(error);
    }
    return NextResponse.json({ error: message }, { status });
  }
}
