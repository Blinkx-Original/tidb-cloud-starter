
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from '../_auth';
import { getDb } from '@/lib/tidbSyncMap/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const { fromKey, toKey, toName } = req.body || {};
  if (!fromKey || !toKey || !toName) return res.status(400).json({ error: 'fromKey, toKey, toName required' });

  const db = getDb();
  const [rows] = await db.query('SELECT * FROM sync_profiles WHERE profile_key=? LIMIT 1', [fromKey]) as any;
  if (!rows.length) return res.status(404).json({ error: 'source not found' });
  const s = rows[0];
  await db.query(`INSERT INTO sync_profiles
    (profile_key,name,table_name,primary_key,updated_at_col,sql_filter,algolia_index,object_id_prefix,url_template,mappings_json)
    VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [toKey, toName, s.table_name, s.primary_key, s.updated_at_col, s.sql_filter, s.algolia_index, s.object_id_prefix, s.url_template, s.mappings_json]);
  res.json({ ok:true });
}
