
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from '../_auth';
import { getDb } from '@/lib/tidbSyncMap/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  const db = getDb();
  const [rows] = await db.query('SELECT profile_key, name, table_name, algolia_index, updated_at FROM sync_profiles ORDER BY name') as any;
  res.json({ items: rows });
}
