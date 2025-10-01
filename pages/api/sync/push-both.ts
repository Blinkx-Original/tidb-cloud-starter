import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../../sync-kit/core/db';
import { resolveIndexName, getIndex } from '../../../sync-kit/core/algolia';
import { slugify } from '../../../sync-kit/core/slugify';

/**
 * Pushes a single row to Algolia and revalidates its product page in Next.js.
 *
 * Required params (query o body):
 *  - db: base de datos
 *  - table: tabla
 *  - id: primary key
 *  - index: nombre base del índice Algolia (SIN prefijo)
 * Opcional:
 *  - objectIdPrefix: prefijo del objectID
 *
 * Revalida la ruta `${NEXT_PUBLIC_PRODUCT_URL_PREFIX || '/product'}/${slug}`.
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

    const slug =
      record.slug ||
      slugify(record.name || record.sku || record.id || String(record.id));
    record.slug = slug;

    const urlPrefix = process.env.NEXT_PUBLIC_PRODUCT_URL_PREFIX || '/product';
    record.url = `${urlPrefix}/${slug}`;

    record.objectID = `${objectIdPrefix || ''}${row.id}`;
    if (record.updated_at == null) {
      record.updated_at = Math.floor(Date.now() / 1000);
    }

    const fullIndexName = resolveIndexName(String(index));
    const algIndex = getIndex(fullIndexName);
    await algIndex.saveObject(record, {
      autoGenerateObjectIDIfNotExist: false,
    });

    // Revalidación ISR de la página del producto
    try {
      await (res as any).revalidate(record.url);
    } catch (revErr) {
      console.warn('Revalidate failed:', revErr);
      // No lo tratamos como fatal; el push ya se hizo.
    }

    res.status(200).json({
      ok: true,
      index: fullIndexName,
      objectID: record.objectID,
      slug,
      url: record.url,
      revalidated: true,
    });
  } catch (err: any) {
    console.error('push-both error', err);
    res.status(500).json({
      error: err?.message || 'Failed to push object and revalidate',
    });
  }
}
