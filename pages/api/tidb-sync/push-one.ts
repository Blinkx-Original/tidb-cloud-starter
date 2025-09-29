import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from './_auth';
import { pushOne } from '@/lib/tidbSync/run';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const { profile = 'products', id } = req.body || {};
  if (id == null) return res.status(400).json({ error: 'id required' });
  const out = await pushOne(String(profile), id);
  res.json(out);
}
