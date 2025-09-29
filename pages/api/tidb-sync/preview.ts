import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from './_auth';
import { preview } from '@/lib/tidbSync/run';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  const profile = String(req.query.profile || 'products');
  const id = String(req.query.id || '');
  if (!id) return res.status(400).json({ error: 'id required' });
  const row = await preview(profile, id);
  res.json({ row });
}
