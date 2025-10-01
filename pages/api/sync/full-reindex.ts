import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../../sync-kit/core/db';
import { resolveIndexName, getIndex } from '../../../sync-kit/core/algolia';
import { slugify } from '../../../sync-kit/core/slugify';

/**
 * Full table reindex from TiDB to Algolia.
 *
 * Required params (query o body):
 *  - db: base de datos
 *  - table: tabla
 *  - index: nombre base del índice Algolia (SIN prefijo)
 * Opcional:
 *  - objectIdPrefix: prefijo del objectID
 *  - chunk: tamaño de lote (default 500)
 *  - clear: true/1/on para limpiar el índice antes
 *
 * Aplica prefijo del índice automáticamente y construye url con
 * NEXT_PUBLIC_PRODUCT_URL_PREFIX (default "/product").
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
  const { db, table, index, objectIdPrefix, chunk, clear } = params || {};

  if (!db || !table || !index) {
    res.status(400).json({
      error: 'Missing required parameters (db, table, index)',
    });
    return;
  }

  const chunkSize = Math.max(1, Number(chunk) || 500);
  const clearIndex =
    clear === 'true' || clear === '1' || clear === true || clear === 'on';

  try {
    const conn = await getConnection(String(db));
    const fullIndexName = resolveIndexName(String(index));
    const algIndex = getIndex(fullIndexName);

    if (clearIndex) {
      await algIndex.clearObjects();
    }

    // Contar total de filas
    const [cntRes] = (await conn.query(
      `SELECT COUNT(*) AS c FROM \`${table}\``
    )) as any;
    const total = Number(cntRes[0]?.c || 0);

    let offset = 0;
    let pushed = 0;

    while (offset < total) {
      const [rows] = (await conn.query(
        `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`,
        [chunkSize, offset]
      )) as any;

      if (!rows || !rows.length) break;

      const urlPrefix = process.env.NEXT_PUBLIC_PRODUCT_URL_PREFIX || '/product';

      const objects = rows.map((row: any) => {
        const obj: any = { ...row };
        const slug =
          obj.slug ||
          slugify(obj.name || obj.sku || obj.id || String(obj.id));
        obj.slug = slug;
        obj.url = `${urlPrefix}/${slug}`;
        obj.objectID = `${objectIdPrefix || ''}${row.id}`;
        if (obj.updated_at == null) {
          obj.updated_at = Math.floor(Date.now() / 1000);
        }
        return obj;
      });

      await algIndex.saveObjects(objects, {
        autoGenerateObjectIDIfNotExist: false,
      });

      pushed += objects.length;
      offset += objects.length;
    }

    await conn.end();

    res.status(200).json({
      ok: true,
      index: fullIndexName,
      total,
      pushed,
    });
  } catch (err: any) {
    console.error('full-reindex error', err);
    res.status(500).json({ error: err?.message || 'Failed to reindex' });
  }
}
