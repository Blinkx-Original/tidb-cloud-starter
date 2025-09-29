
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from '../_auth';
import { previewRow } from '@/lib/tidbSyncMap/engine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  const profile = String(req.query.profile || '');
  const id = req.query.id as string;
  if (!profile || !id) return res.status(400).json({ error: 'profile and id required' });
  const row = await previewRow(profile, id);
  res.json({ row });
}
