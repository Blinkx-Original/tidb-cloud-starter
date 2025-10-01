import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../../sync-kit/core/db';
import { resolveIndexName, getIndex } from '../../../sync-kit/core/algolia';
import { slugify } from '../../../sync-kit/core/slugify';

/**
 * Pushes a single row from a TiDB table into an Algolia index.
 *
 * Required params (query o body):
 *  - db: nombre de la base de datos (schema) en TiDB
 *  - table: nombre de la tabla
 *  - id: primary key del registro (columna id)
 *  - index: nombre base del índice Algolia (SIN prefijo)
 * Opcional:
 *  - objectIdPrefix: prefijo para objectID (p.ej. "prod_")
 *
 * Usa automáticamente NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX/ALGOLIA_INDEX_PREFIX.
 * Calcula slug y url con NEXT_PUBLIC_PRODUCT_URL_PREFIX (default "/product").
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

  const params: any = req.method === 'GET' ? req.query : req.body;
  const { db, table, id, index, objectIdPrefix } = params || {};

  if (!db || !table || !id || !index) {
    res.status(400).json({
      error: 'Missing required parameters (db, table, id, index)',
    });
    return;
  }

  try {
    const conn = await getConnection(String(db));
    const [rows] = (await conn.query(
      `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`,
      [id]
    )) as any;
    await conn.end();

    if (!rows || !rows.length) {
      res.status(404).json({ error: 'Row not found' });
      return;
    }

    const row = rows[0];
    const record: any = { ...row };

    // slug y url
    const slug =
      record.slug ||
      slugify(record.name || record.sku || record.id || String(record.id));
    record.slug = slug;

    const urlPrefix = process.env.NEXT_PUBLIC_PRODUCT_URL_PREFIX || '/product';
    record.url = `${urlPrefix}/${slug}`;

    // objectID y updated_at
    record.objectID = `${objectIdPrefix || ''}${row.id}`;
    if (record.updated_at == null) {
      record.updated_at = Math.floor(Date.now() / 1000);
    }

    // índice con prefijo (si aplica)
    const fullIndexName = resolveIndexName(String(index));
    const algIndex = getIndex(fullIndexName);

    await algIndex.saveObject(record, {
      autoGenerateObjectIDIfNotExist: false,
    });

    res.status(200).json({
      ok: true,
      index: fullIndexName,
      objectID: record.objectID,
      slug,
      url: record.url,
    });
  } catch (err: any) {
    console.error('push-one error', err);
    res.status(500).json({ error: err?.message || 'Failed to push object' });
  }
}
