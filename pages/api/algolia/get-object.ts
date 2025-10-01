import type { NextApiRequest, NextApiResponse } from 'next';
import algoliasearch from 'algoliasearch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const indexName = (req.query.index || 'blinkx_wp').toString();
  const objectID = (req.query.objectID || '').toString();

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const adminKey =
    process.env.ALGOLIA_ADMIN_KEY ||
    process.env.ALGOLIA_WRITE_KEY ||
    process.env.ALGOLIA_API_KEY!;

  if (!appId || !adminKey || !objectID) {
    res.status(400).json({ error: 'Missing appId/adminKey/objectID' });
    return;
  }

  try {
    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);
    const obj = await index.getObject(objectID);
    res.status(200).json({ index: indexName, objectID, object: obj });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'getObject failed' });
  }
}
