import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../../sync-kit/core/db';
import { resolveIndexName, getIndex } from '../../../sync-kit/core/algolia';
import { slugify } from '../../../sync-kit/core/slugify';

function resolveSite() {
  return process.env.NEXT_PUBLIC_SITE_KEY || process.env.SITE_KEY || 'blinkx';
}
function resolveEnv(): 'prod' | 'dev' {
  const from =
    (process.env.NEXT_PUBLIC_RUNTIME_ENV ||
      process.env.RUNTIME_ENV ||
      process.env.VERCEL_ENV ||
      'prod')
      .toString()
      .toLowerCase();
  return /dev|preview|staging/.test(from) ? 'dev' : 'prod';
}
function toBool(v: any, fallback = true) {
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1' || v === 'true' || v === 'TRUE') return true;
  if (v === 0 || v === '0' || v === 'false' || v === 'FALSE') return false;
  return fallback;
}

/** Push 1 fila de TiDB a Algolia (con enriquecimiento para filtros del front). */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const p: any = req.method === 'GET' ? req.query : req.body;
  const { db, table, id, index, objectIdPrefix } = p || {};
  if (!db || !table || !id || !index) {
    res.status(400).json({ error: 'Missing required parameters (db, table, id, index)' });
    return;
  }

  try {
    const conn = await getConnection(String(db));
    const [rows] = (await conn.query(`SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`, [id])) as any;
    await conn.end();
    if (!rows || !rows.length) {
      res.status(404).json({ error: 'Row not found' });
      return;
    }

    const row = rows[0];
    const record: any = { ...row };

    // slug & url
    const slug = record.slug || slugify(record.name || record.sku || record.id || String(record.id));
    record.slug = slug;
    const urlPrefix = process.env.NEXT_PUBLIC_PRODUCT_URL_PREFIX || '/product';
    record.url = `${urlPrefix}/${slug}`;

    // objectID, updated_at
    record.objectID = String(`${objectIdPrefix || ''}${row.id}`);
    if (record.updated_at == null) record.updated_at = Math.floor(Date.now() / 1000);

    // ENRICH para cumplir filtros del front
    record.site = record.site || resolveSite();
    record.type = 'product';
    record.env = record.env || resolveEnv();
    record.published = toBool(record.published, true);
    record.in_stock = toBool(record.in_stock, true);

    const fullIndexName = resolveIndexName(String(index));
    const algIndex = getIndex(fullIndexName);
    await algIndex.saveObject(record, { autoGenerateObjectIDIfNotExist: false });

    res.status(200).json({
      ok: true,
      index: fullIndexName,
      objectID: record.objectID,
      slug,
      url: record.url,
      site: record.site,
      env: record.env,
      published: record.published,
      in_stock: record.in_stock,
    });
  } catch (err: any) {
    console.error('push-one error', err);
    res.status(500).json({ error: err?.message || 'Failed to push object' });
  }
}

