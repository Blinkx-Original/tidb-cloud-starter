import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../../sync-kit/core/db';
import { getIndex } from '../../../sync-kit/core/algolia';
import { slugify } from '../../../sync-kit/core/slugify';

/**
 * Pushes a single row from a TiDB table into an Algolia index.
 *
 * Accepts either GET or POST. Required parameters (query or body):
 *  - db: database/schema name
 *  - table: table name
 *  - id: primary key value (row id)
 *  - index: name of the Algolia index
 * Optional:
 *  - objectIdPrefix: prefix to prepend to the Algolia objectID
 *
 * Returns: { ok: true, objectID: string, slug: string } on success.
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
  const { db, table, id, index, objectIdPrefix } = params;
  if (!db || !table || !id || !index) {
    res
      .status(400)
      .json({ error: 'Missing required parameters (db, table, id, index)' });
    return;
  }
  try {
    const connection = await getConnection(String(db));
    const [rows] = (await connection.query(
      `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`,
      [id]
    )) as any;
    await connection.end();
    if (!rows || !rows.length) {
      res.status(404).json({ error: 'Row not found' });
      return;
    }
    const row = rows[0];
    // Build object with all columns
    const record: any = {};
    Object.keys(row).forEach((col) => {
      record[col] = row[col];
    });
    // Compute slug and url. Fallbacks mirror the WP plugin: slug -> slugify(name) or id
    const slug =
      record.slug ||
      slugify(record.name || record.sku || record.id || String(record.id));
    record.slug = slug;
    record.url = `/p/${slug}`;
    record.objectID = `${objectIdPrefix || ''}${row.id}`;
    if (record.updated_at == null) {
      // Use seconds timestamp if not present
      record.updated_at = Math.floor(Date.now() / 1000);
    }
    // Save to Algolia
    const algIndex = getIndex(String(index));
    await algIndex.saveObject(record, {
      autoGenerateObjectIDIfNotExist: false,
    });
    res.status(200).json({ ok: true, objectID: record.objectID, slug });
  } catch (err: any) {
    console.error('push-one endpoint error', err);
    res.status(500).json({ error: err?.message || 'Failed to push object' });
  }
}