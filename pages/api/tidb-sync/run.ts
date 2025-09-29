
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from './_auth';
import { fullReindexByKey, pushOneByKey } from '@/lib/tidbSyncMap/engine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  const mode = String(req.query.mode || 'full');
  if (mode === 'one') {
    if (req.method !== 'POST') return res.status(405).end();
    const { profile, id } = req.body || {};
    if (!profile || id == null) return res.status(400).json({ error: 'profile and id required' });
    const out = await pushOneByKey(String(profile), id);
    return res.json(out);
  } else {
    if (req.method !== 'POST') return res.status(405).end();
    const { profile, chunkSize = 500, clear = false } = req.body || {};
    if (!profile) return res.status(400).json({ error: 'profile required' });
    const out = await fullReindexByKey(String(profile), Number(chunkSize), !!clear);
    return res.json({ ok:true, ...out });
  }
}
