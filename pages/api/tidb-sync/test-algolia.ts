
import type { NextApiRequest, NextApiResponse } from 'next';
import algoliasearch from 'algoliasearch';
export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const app = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, key = process.env.ALGOLIA_ADMIN_KEY!;
    const idx = (process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || '') + (process.env.ALGOLIA_INDEX || 'catalog__items');
    await algoliasearch(app, key).initIndex(idx).getSettings();
    return res.json({ ok: true, index: idx });
  } catch (e:any) { return res.status(500).json({ ok:false, error:e.message }); }
}
