import type { NextApiRequest, NextApiResponse } from 'next';
import algoliasearch from 'algoliasearch/lite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const indexName = (req.query.index || 'blinkx_wp').toString();
  const q = (req.query.q || '').toString();

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const searchKey =
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ||
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '';

  if (!appId || !searchKey) {
    res.status(400).json({ error: 'Missing NEXT_PUBLIC_ALGOLIA_* envs' });
    return;
  }

  try {
    const client = algoliasearch(appId, searchKey);
    const index = client.initIndex(indexName);
    const out = await index.search(q, { hitsPerPage: 5 });
    res.status(200).json({ index: indexName, q, nbHits: out.nbHits, hits: out.hits });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'search failed' });
  }
}
