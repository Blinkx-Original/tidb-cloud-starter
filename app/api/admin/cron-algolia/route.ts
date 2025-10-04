import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/sync/auth';
import { runAlgoliaSync } from '@/lib/sync/algolia';
import { withSyncLock } from '@/lib/sync/lock';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  let payload: { batchSize?: number; maxDurationMs?: number } = {};
  try {
    payload = (await req.json()) ?? {};
  } catch {
    payload = {};
  }
  try {
    const summary = await withSyncLock('algolia', () =>
      runAlgoliaSync({
        triggeredBy: 'cron',
        batchSize: payload.batchSize,
        maxDurationMs: payload.maxDurationMs,
      }),
    );
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
