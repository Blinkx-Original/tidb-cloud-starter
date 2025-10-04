import { fetchRecentLogs, fetchLatestLog } from './log';
import { fetchRecentCheckpoints } from './tidb';
import { SyncSummary } from './types';

export async function getDashboardData() {
  const [logs, checkpoints, algoliaLog, productPagesLog] = await Promise.all([
    fetchRecentLogs(50),
    fetchRecentCheckpoints(),
    fetchLatestLog('algolia'),
    fetchLatestLog('product-pages'),
  ]);

  const checkpointsMap = new Map(checkpoints.map((c) => [c.target, c.lastUpdatedAt.toISOString()]));

  const summary: Record<string, SyncSummary | null> = {
    algolia: algoliaLog
      ? {
          target: 'algolia',
          startedAt: algoliaLog.startedAt.toISOString(),
          finishedAt: (algoliaLog.finishedAt ?? algoliaLog.startedAt).toISOString(),
          ok: algoliaLog.okCount,
          failed: algoliaLog.failCount,
          notes: algoliaLog.notes || undefined,
          checkpoint: checkpointsMap.get('algolia') || undefined,
        }
      : null,
    productPages: productPagesLog
      ? {
          target: 'product-pages',
          startedAt: productPagesLog.startedAt.toISOString(),
          finishedAt: (productPagesLog.finishedAt ?? productPagesLog.startedAt).toISOString(),
          ok: productPagesLog.okCount,
          failed: productPagesLog.failCount,
          notes: productPagesLog.notes || undefined,
        }
      : null,
  };

  return {
    logs: logs.map((log) => ({
      id: log.id,
      target: log.target,
      startedAt: log.startedAt.toISOString(),
      finishedAt: log.finishedAt ? log.finishedAt.toISOString() : null,
      ok: log.okCount,
      failed: log.failCount,
      notes: log.notes,
    })),
    checkpoints: Array.from(checkpointsMap.entries()).map(([target, value]) => ({
      target,
      value,
    })),
    summary,
  };
}
