import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/sync/auth';
import { withSyncLock } from '@/lib/sync/lock';
import { createLog, finalizeLog } from '@/lib/sync/log';
import {
  pushAllProductPages,
  pushSelectedProductPages,
} from '@/lib/sync/product-pages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function parseChunkSize(input: unknown): number {
  const fallback = 300;
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input;
  }
  if (typeof input === 'string' && input.trim()) {
    const parsed = Number.parseInt(input.trim(), 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function buildMessage(ok: number, failed: number, processed: number) {
  if (!processed) {
    return 'No products processed.';
  }
  if (failed === 0) {
    return `Published ${ok} product pages successfully.`;
  }
  return `Published ${ok} product pages with ${failed} failures.`;
}

export async function POST(req: Request) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const mode = body?.mode === 'all' ? 'all' : body?.mode === 'selected' ? 'selected' : null;
  if (!mode) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  const chunkSize = parseChunkSize(body?.chunkSize);

  return withSyncLock('product-pages', async () => {
    const logId = await createLog('product-pages');
    try {
      const result = await (mode === 'all'
        ? pushAllProductPages({
            chunkSize,
            onRevalidate: (slug) => revalidatePath(`/p/${slug}`),
          })
        : pushSelectedProductPages(
            body?.identifiers ? String(body.identifiers).split(',') : [],
            {
              chunkSize,
              onRevalidate: (slug) => revalidatePath(`/p/${slug}`),
            },
          ));

      await finalizeLog(logId, {
        ok: result.ok,
        failed: result.failed,
        notes: result.notes,
      });

      return NextResponse.json({
        ok: true,
        result,
        message: buildMessage(result.ok, result.failed, result.processed),
      });
    } catch (error: any) {
      await finalizeLog(logId, {
        ok: 0,
        failed: 0,
        notes: { mode, chunkSize },
        error: error instanceof Error ? error : new Error(String(error)),
      });
      const message =
        error instanceof Error ? error.message : 'Failed to push product pages.';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}
