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
  const { db, table, index, objectIdPrefix, chunk, clear } = p || {};
  if (!db || !table || !index) {
    res.status(400).json({ error: 'Missing required parameters (db, table, index)' });
    return;
  }

  const chunkSize = Math.max(1, Number(chunk) || 500);
  const clearIndex = clear === 'true' || clear === '1' || clear === true || clear === 'on';

  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
    const adminKey =
      process.env.ALGOLIA_ADMIN_KEY ||
      process.env.ALGOLIA_WRITE_KEY ||
      process.env.ALGOLIA_API_KEY!;
    const client = algoliasearch(appId, adminKey);
    const algIndex = client.initIndex(String(index));

    if (clearIndex) await algIndex.clearObjects();

    const conn = await getConnection(String(db));
    const [cnt] = (await conn.query(`SELECT COUNT(*) AS c FROM \`${table}\``)) as any;
    const total = Number(cnt[0]?.c || 0);

    let offset = 0;
    let pushed = 0;

    const urlPrefix = process.env.NEXT_PUBLIC_PRODUCT_URL_PREFIX || '/product';
    const siteVal = resolveSite();
    const envVal = resolveEnv();

    while (offset < total) {
      const [rows] = (await conn.query(
        `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`,
        [chunkSize, offset]
      )) as any;
      if (!rows || !rows.length) break;

      const objects = rows.map((row: any) => {
        const obj: any = { ...row };
        const slug = obj.slug || slugify(obj.name || obj.sku || obj.id || String(obj.id));
        obj.slug = slug;
        obj.url = `${urlPrefix}/${slug}`;
        obj.objectID = String(`${objectIdPrefix || ''}${row.id}`);
        if (obj.updated_at == null) obj.updated_at = Math.floor(Date.now() / 1000);

        obj.title = obj.title || obj.name;   // 👈 clave
        obj.site = obj.site || siteVal;
        obj.type = 'product';
        obj.env = obj.env || envVal;
        obj.published = toBool(obj.published, true);
        obj.in_stock = toBool(obj.in_stock, true);
        return obj;
      });

      await algIndex.saveObjects(objects, { autoGenerateObjectIDIfNotExist: false });
      pushed += objects.length;
      offset += objects.length;
    }

    await conn.end();
    res.status(200).json({ ok: true, index: String(index), total, pushed });
  } catch (err: any) {
    console.error('full-reindex error', err);
    res.status(500).json({ error: err?.message || 'Failed to reindex' });
  }
}
