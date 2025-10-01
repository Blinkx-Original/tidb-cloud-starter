import type { NextApiRequest, NextApiResponse } from 'next';
import algoliasearch from 'algoliasearch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const indexBase = (req.query.index || req.body?.index || 'blinkx_wp').toString();
  const prefixRaw = (process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || '').trim();
  const prefix = prefixRaw ? (prefixRaw.endsWith('_') ? prefixRaw : `${prefixRaw}_`) : '';
  const indexName = `${prefix}${indexBase}`;

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const adminKey =
    process.env.ALGOLIA_ADMIN_KEY ||
    process.env.ALGOLIA_WRITE_KEY ||
    process.env.ALGOLIA_API_KEY!;
  if (!appId || !adminKey) {
    res.status(400).json({ error: 'Missing Algolia credentials' });
    return;
  }

  try {
    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    await index.setSettings({
      // para facetFilters / filters del front
      attributesForFaceting: [
        'searchable(site)',
        'type',
        'env',
        'published',
        'in_stock',
        'category',
        'brand',
      ],
      // opcional: mejora búsqueda por nombre/sku
      searchableAttributes: [
        'title',
        'name',
        'sku',
        'unordered(description)',
        'unordered(short_description)',
        'categories',
        'brand'
      ],
    });

    res.status(200).json({ ok: true, index: indexName, applied: true });
  } catch (e: any) {
    console.error('apply-index-settings error', e);
    res.status(500).json({ error: e?.message || 'Failed to set index settings' });
  }
}
