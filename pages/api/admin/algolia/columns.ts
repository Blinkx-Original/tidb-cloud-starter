import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin_auth'
import { query } from '@/lib/dbClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const { database, table } = req.query as { database?: string; table?: string }
  const db = database || process.env.TIDB_DB || process.env.TIDB_DATABASE || ''
  // Validate that both database and table names are provided
  if (!db || !table) {
    return res.status(400).json({ error: 'Missing database or table' })
  }
  try {
    const columns = await query<{ COLUMN_NAME: string; DATA_TYPE: string }>(
      `SELECT COLUMN_NAME, DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [db, table]
    )
    res.status(200).json({ columns })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
