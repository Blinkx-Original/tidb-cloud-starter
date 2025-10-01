import type { NextApiRequest, NextApiResponse } from 'next';
import algoliasearch from 'algoliasearch';
import { getConnection } from '../../../sync-kit/core/db';
import { slugify } from '../../../sync-kit/core/slugify';

function resolveSite() {
  return process.env.NEXT_PUBLIC_SITE_KEY || process.env.SITE_KEY || 'blinkx';
}
function resolveEnv(): 'prod' | 'dev' {
  const from =
    (process.env.NEXT_PUBLIC_RUNTIME_ENV ||
     process.env.RUNTIME_ENV ||
     process.env.VERCEL_ENV ||
     'prod').toString().toLowerCase();
  return /dev|preview|staging/.test(from) ? 'dev' : 'prod';
}
function toBool(v: any, fallback = true) {
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1' || v === 'true' || v === 'TRUE') return true;
  if (v === 0 || v === '0' || v === 'false' || v === 'FALSE') return false;
  return fallback;
}

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

    const slug = record.slug || slugify(record.name || record.sku || record.id || String(record.id));
    record.slug = slug;
    const urlPrefix = process.env.NEXT_PUBLIC_PRODUCT_URL_PREFIX || '/product';
    record.url = `${urlPrefix}/${slug}`;

    record.objectID = String(`${objectIdPrefix || ''}${row.id}`);
    if (record.updated_at == null) record.updated_at = Math.floor(Date.now() / 1000);

    if (!record.title && record.name) record.title = record.name;

    record.site = record.site || resolveSite();
    record.type = 'product';
    record.env = record.env || resolveEnv();
    record.published = toBool(record.published, true);
    record.in_stock = toBool(record.in_stock, true);

    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
    const adminKey =
      process.env.ALGOLIA_ADMIN_KEY ||
      process.env.ALGOLIA_WRITE_KEY ||
      process.env.ALGOLIA_API_KEY!;
    const client = algoliasearch(appId, adminKey);
    const algIndex = client.initIndex(String(index));

    await algIndex.saveObject(record, { autoGenerateObjectIDIfNotExist: false });

    try {
      await (res as any).revalidate(record.url);
    } catch (e) {
      console.warn('Revalidate failed', e);
    }

    res.status(200).json({
      ok: true,
      index: String(index),
      objectID: record.objectID,
      slug,
      url: record.url,
      site: record.site,
      env: record.env,
      published: record.published,
      in_stock: record.in_stock,
      revalidated: true,
    });
  } catch (err: any) {
    console.error('push-both error', err);
    res.status(500).json({ error: err?.message || 'Failed to push object and revalidate' });
  }
}


