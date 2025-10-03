import { getPool, ensureSyncTables } from './tidb';
import { SyncSummary, SyncTarget } from './types';

type RawLogRow = {
  id: number;
  target: SyncTarget;
  started_at: Date;
  finished_at: Date | null;
  ok_count: number | null;
  fail_count: number | null;
  notes: string | null;
};

export type SyncLogRecord = {
  id: number;
  target: SyncTarget;
  startedAt: Date;
  finishedAt: Date | null;
  okCount: number;
  failCount: number;
  notes: Record<string, unknown> | null;
};

function parseNotes(notes: string | null): Record<string, unknown> | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    return null;
  } catch {
    return { raw: notes };
  }
}

function mapRow(row: RawLogRow): SyncLogRecord {
  return {
    id: row.id,
    target: row.target,
    startedAt: new Date(row.started_at),
    finishedAt: row.finished_at ? new Date(row.finished_at) : null,
    okCount: row.ok_count ?? 0,
    failCount: row.fail_count ?? 0,
    notes: parseNotes(row.notes),
  };
}

export async function createLog(target: SyncTarget): Promise<number> {
  await ensureSyncTables();
  const [result] = await getPool().execute(
    'INSERT INTO sync_log (target, started_at, ok_count, fail_count) VALUES (?, NOW(), 0, 0)',
    [target],
  );
  const { insertId } = result as { insertId: number };
  return insertId;
}

export async function finalizeLog(
  id: number,
  {
    ok,
    failed,
    notes,
    error,
  }: { ok: number; failed: number; notes?: Record<string, unknown>; error?: Error | null },
): Promise<void> {
  await ensureSyncTables();
  const finishedAt = new Date();
  const payload = notes ? JSON.stringify(notes) : null;
  const baseSql = `UPDATE sync_log SET finished_at = ?, ok_count = ?, fail_count = ?, notes = ? WHERE id = ?`;
  const effectiveNotes = error ? JSON.stringify({ ...(notes || {}), error: error.message }) : payload;
  await getPool().execute(baseSql, [finishedAt, ok, failed, effectiveNotes, id]);
}

export async function fetchLatestLog(target: SyncTarget): Promise<SyncLogRecord | null> {
  await ensureSyncTables();
  const [rows] = await getPool().query(
    'SELECT * FROM sync_log WHERE target = ? ORDER BY started_at DESC LIMIT 1',
    [target],
  );
  const arr = rows as RawLogRow[];
  return arr.length ? mapRow(arr[0]) : null;
}

export async function fetchRecentLogs(limit = 50): Promise<SyncLogRecord[]> {
  await ensureSyncTables();
  const [rows] = await getPool().query(
    'SELECT * FROM sync_log ORDER BY started_at DESC LIMIT ?',
    [limit],
  );
  const arr = rows as RawLogRow[];
  return arr.map(mapRow);
}

export function toSummary(target: SyncTarget, log: SyncLogRecord | null): SyncSummary | null {
  if (!log) return null;
  return {
    target,
    startedAt: log.startedAt.toISOString(),
    finishedAt: (log.finishedAt ?? log.startedAt).toISOString(),
    ok: log.okCount,
    failed: log.failCount,
    notes: log.notes || undefined,
    checkpoint: log.notes && typeof log.notes.checkpoint === 'string' ? (log.notes.checkpoint as string) : undefined,
  };
}
