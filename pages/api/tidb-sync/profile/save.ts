
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from '../_auth';
import { getDb } from '@/lib/tidbSyncMap/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const b = req.body || {};
  if (!b.profile_key || !b.name || !b.table_name || !b.primary_key || !b.algolia_index) {
    return res.status(400).json({ error: 'missing fields' });
  }
  const db = getDb();
  const mappings = JSON.stringify(b.mappings_json || []);
  await db.query(`INSERT INTO sync_profiles
    (profile_key,name,table_name,primary_key,updated_at_col,sql_filter,algolia_index,object_id_prefix,url_template,mappings_json)
    VALUES (?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
    name=VALUES(name), table_name=VALUES(table_name), primary_key=VALUES(primary_key),
    updated_at_col=VALUES(updated_at_col), sql_filter=VALUES(sql_filter), algolia_index=VALUES(algolia_index),
    object_id_prefix=VALUES(object_id_prefix), url_template=VALUES(url_template), mappings_json=VALUES(mappings_json)`,
    [b.profile_key,b.name,b.table_name,b.primary_key,b.updated_at_col||null,b.sql_filter||null,b.algolia_index,b.object_id_prefix||null,b.url_template||null,mappings]);
  res.json({ ok:true });
}
