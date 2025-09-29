import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/lib/tidbSync/db';
export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try { const db = getDb(); const [r] = await db.query('SELECT 1 AS ok'); return res.json({ ok: r && (r as any)[0]?.ok === 1 }); }
  catch (e:any) { return res.status(500).json({ ok:false, error:e.message }); }
}
