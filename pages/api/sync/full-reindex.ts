import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../../sync-kit/core/db';
import { getIndex } from '../../../sync-kit/core/algolia';
import { slugify } from '../../../sync-kit/core/slugify';

/**
 * Performs a full reindex of an entire table into an Algolia index.
 *
 * Required parameters (query or body):
 *  - db: database name
 *  - table: table name
 *  - index: Algolia index name
 * Optional:
 *  - objectIdPrefix: prefix for the objectID
 *  - chunk: number of rows per batch (defaults to 500)
 *  - clear: whether to clear the index before reindexing (false by default)
 *
 * Returns: { ok: true, total: number, pushed: number }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const params = req.method === 'GET' ? req.query : req.body;
  const { db, table, index, objectIdPrefix, chunk, clear } = params;
  if (!db || !table || !index) {
    res
      .status(400)
      .json({ error: 'Missing required parameters (db, table, index)' });
    return;
  }
  const chunkSize = Math.max(1, Number(chunk) || 500);
  const clearIndex =
    clear === 'true' ||
    clear === '1' ||
    clear === true ||
    clear === 'on';
  try {
    const connection = await getConnection(String(db));
    const algIndex = getIndex(String(index));
    if (clearIndex) {
      await algIndex.clearObjects();
    }
    // Count total rows
    const [cntRes] = (await connection.query(
      `SELECT COUNT(*) AS c FROM \`${table}\``
    )) as any;
    const total = Number(cntRes[0]?.c || 0);
    let offset = 0;
    let pushed = 0;
    while (offset < total) {
      const [rows] = (await connection.query(
        `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`,
        [chunkSize, offset]
      )) as any;
      if (!rows || !rows.length) {
        break;
      }
      const objects = rows.map((row: any) => {
        const obj: any = {};
        Object.keys(row).forEach((col) => {
          obj[col] = row[col];
        });
        const slug =
          obj.slug ||
          slugify(obj.name || obj.sku || obj.id || String(obj.id));
        obj.slug = slug;
        obj.url = `/p/${slug}`;
        obj.objectID = `${objectIdPrefix || ''}${row.id}`;
        if (obj.updated_at == null) {
          obj.updated_at = Math.floor(Date.now() / 1000);
        }
        return obj;
      });
      // Save batch to Algolia
      await algIndex.saveObjects(objects, {
        autoGenerateObjectIDIfNotExist: false,
      });
      pushed += objects.length;
      offset += objects.length;
    }
    await connection.end();
    res.status(200).json({ ok: true, total, pushed });
  } catch (err: any) {
    console.error('full-reindex endpoint error', err);
    res.status(500).json({ error: err?.message || 'Failed to reindex' });
  }
}