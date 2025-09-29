
import type { NextApiRequest, NextApiResponse } from 'next';
import { fullReindexByKey } from '@/lib/tidbSyncMap/engine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept Vercel Cron
  if (req.headers['x-vercel-cron'] !== '1') {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).end();
  }
  const profile = String(req.query.profile || '');
  const chunkSize = Number(req.query.chunkSize ?? 500);
  const clear = String(req.query.clear ?? 'false') === 'true';
  if (!profile) return res.status(400).json({ error: 'profile required' });

  const out = await fullReindexByKey(profile, chunkSize, clear);
  return res.json({ ok: true, ...out });
}
