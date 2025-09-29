import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from './_auth';
import { fullReindex } from '@/lib/tidbSync/run';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const { profile = 'products', chunkSize = 500, clear = false } = req.body || {};
  const out = await fullReindex(String(profile), Number(chunkSize), !!clear);
  res.json({ ok: true, ...out });
}
