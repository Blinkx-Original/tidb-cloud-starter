
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from '../_auth';
import { columnsForTable } from '@/lib/tidbSyncMap/engine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req, res)) return;
  const table = String(req.query.table || '');
  if (!table) return res.status(400).json({ error: 'table required' });
  const cols = await columnsForTable(table);
  res.json({ columns: cols });
}
