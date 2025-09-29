
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from '../_auth';
import { getDb } from '@/lib/tidbSyncMap/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  const key = String(req.query.key || '');
  if (!key) return res.status(400).json({ error: 'key required' });
  const db = getDb();
  const [rows] = await db.query('SELECT * FROM sync_profiles WHERE profile_key=? LIMIT 1', [key]) as any;
  if (!rows.length) return res.json({ item: null });
  const item = rows[0];
  try { item.mappings_json = typeof item.mappings_json==='string' ? JSON.parse(item.mappings_json) : item.mappings_json; } catch {}
  res.json({ item });
}
