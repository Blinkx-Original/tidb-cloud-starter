import { getPool } from './tidb';

export type PushOptions = {
  chunkSize: number;
  onRevalidate?: (slug: string) => Promise<void> | void;
};

export type PushResult = {
  processed: number;
  ok: number;
  failed: number;
  notes: Record<string, unknown>;
};

type BasicProductRow = {
  id: number;
  slug: string | null;
};

const NOTE_SAMPLE_LIMIT = 25;

function clampChunkSize(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Chunk size must be a positive number');
  }
  return Math.max(1, Math.floor(value));
}

function takeSample<T>(items: T[], limit = NOTE_SAMPLE_LIMIT): T[] {
  if (items.length <= limit) return items;
  return items.slice(0, limit);
}

async function markProductsPublished(ids: number[]): Promise<number> {
  if (!ids.length) return 0;
  const [result] = await getPool().execute(
    'UPDATE products SET is_published = 1, last_tidb_update_at = NOW() WHERE id IN (?)',
    [ids],
  );
  const { affectedRows } = result as { affectedRows?: number };
  return affectedRows ?? 0;
}

function normalizeIdentifier(value: string): string {
  return value
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\s\u00A0]+/g, ' ')
    .trim();
}

type SelectedRow = BasicProductRow & { identifier: string };

type SelectedAggregation = {
  rows: SelectedRow[];
  missing: string[];
};

async function collectSelectedRows(
  identifiers: string[],
): Promise<SelectedAggregation> {
  const normalized = Array.from(
    new Set(
      identifiers
        .map((id) => normalizeIdentifier(id))
        .filter((id) => id.length > 0),
    ),
  );

  if (!normalized.length) {
    return { rows: [], missing: [] };
  }

  const idCandidates = normalized
    .filter((value) => /^\d+$/.test(value))
    .map((value) => Number.parseInt(value, 10));

  const slugCandidates = normalized.filter((value) => !/^\d+$/.test(value));

  const pool = getPool();
  const rowsById: Map<number, BasicProductRow> = new Map();
  const rowsBySlug: Map<string, BasicProductRow> = new Map();

  if (idCandidates.length) {
    const [rows] = await pool.query(
      'SELECT id, slug FROM products WHERE id IN (?)',
      [idCandidates],
    );
    for (const row of rows as BasicProductRow[]) {
      rowsById.set(row.id, row);
      if (row.slug) {
        rowsBySlug.set(row.slug, row);
      }
    }
  }

  if (slugCandidates.length) {
    const [rows] = await pool.query(
      'SELECT id, slug FROM products WHERE slug IN (?)',
      [slugCandidates],
    );
    for (const row of rows as BasicProductRow[]) {
      rowsById.set(row.id, row);
      if (row.slug) {
        rowsBySlug.set(row.slug, row);
      }
    }
  }

  const uniqueRows: Map<number, SelectedRow> = new Map();
  const missing: string[] = [];

  for (const identifier of normalized) {
    const numeric = /^\d+$/.test(identifier);
    let row: BasicProductRow | undefined;
    if (numeric) {
      row = rowsById.get(Number.parseInt(identifier, 10));
      if (!row) {
        row = rowsBySlug.get(identifier);
      }
    } else {
      row = rowsBySlug.get(identifier);
    }

    if (row) {
      if (!uniqueRows.has(row.id)) {
        uniqueRows.set(row.id, { ...row, identifier });
      }
    } else {
      missing.push(identifier);
    }
  }

  return {
    rows: Array.from(uniqueRows.values()),
    missing,
  };
}

export async function pushSelectedProductPages(
  identifiers: string[],
  { chunkSize, onRevalidate }: PushOptions,
): Promise<PushResult> {
  const effectiveChunkSize = clampChunkSize(chunkSize);
  const { rows, missing } = await collectSelectedRows(identifiers);

  if (!rows.length && !missing.length) {
    return {
      processed: 0,
      ok: 0,
      failed: 0,
      notes: { message: 'No identifiers provided' },
    };
  }

  const ids = rows.map((row) => row.id);
  await markProductsPublished(ids);

  let ok = 0;
  let failed = 0;
  const slugless: Array<{ id: number; identifier: string }> = [];
  const revalidateErrors: Array<{ id: number; slug: string; error: string }> = [];

  for (const row of rows) {
    if (!row.slug) {
      failed += 1;
      slugless.push({ id: row.id, identifier: row.identifier });
      continue;
    }

    if (onRevalidate) {
      try {
        await onRevalidate(row.slug);
        ok += 1;
      } catch (error: any) {
        failed += 1;
        revalidateErrors.push({
          id: row.id,
          slug: row.slug,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      ok += 1;
    }
  }

  const notes: Record<string, unknown> = {
    mode: 'selected',
    chunkSize: effectiveChunkSize,
    requested: identifiers.length,
    matched: rows.length,
  };

  if (missing.length) {
    notes.missing = takeSample(missing);
    notes.missingCount = missing.length;
  }

  if (slugless.length) {
    notes.slugless = takeSample(slugless);
    notes.sluglessCount = slugless.length;
  }

  if (revalidateErrors.length) {
    notes.revalidateErrors = takeSample(revalidateErrors);
    notes.revalidateErrorCount = revalidateErrors.length;
  }

  return {
    processed: rows.length,
    ok,
    failed: failed + missing.length,
    notes,
  };
}

export async function pushAllProductPages(
  { chunkSize, onRevalidate }: PushOptions,
): Promise<PushResult> {
  const effectiveChunkSize = clampChunkSize(chunkSize);
  const pool = getPool();
  let lastId = 0;
  let processed = 0;
  let ok = 0;
  let failed = 0;

  const slugless: Array<{ id: number }> = [];
  const revalidateErrors: Array<{ id: number; slug: string; error: string }> = [];

  while (true) {
    const [rows] = await pool.query(
      'SELECT id, slug FROM products WHERE id > ? ORDER BY id ASC LIMIT ?',
      [lastId, effectiveChunkSize],
    );
    const batch = rows as BasicProductRow[];
    if (!batch.length) {
      break;
    }

    const ids = batch.map((row) => row.id);
    await markProductsPublished(ids);

    processed += batch.length;

    for (const row of batch) {
      if (!row.slug) {
        failed += 1;
        slugless.push({ id: row.id });
        continue;
      }

      if (onRevalidate) {
        try {
          await onRevalidate(row.slug);
          ok += 1;
        } catch (error: any) {
          failed += 1;
          revalidateErrors.push({
            id: row.id,
            slug: row.slug,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else {
        ok += 1;
      }
    }

    lastId = batch[batch.length - 1].id;
  }

  const notes: Record<string, unknown> = {
    mode: 'all',
    chunkSize: effectiveChunkSize,
    processed,
  };

  if (slugless.length) {
    notes.slugless = takeSample(slugless);
    notes.sluglessCount = slugless.length;
  }

  if (revalidateErrors.length) {
    notes.revalidateErrors = takeSample(revalidateErrors);
    notes.revalidateErrorCount = revalidateErrors.length;
  }

  return {
    processed,
    ok,
    failed,
    notes,
  };
}
