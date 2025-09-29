
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from '../_auth';
import { getDb } from '@/lib/tidbSyncMap/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const key = String(req.body?.key || '');
  if (!key) return res.status(400).json({ error: 'key required' });
  const db = getDb();
  await db.query('DELETE FROM sync_profiles WHERE profile_key=?', [key]);
  res.json({ ok:true });
}
