import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin_auth'
import { query } from '@/lib/dbClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminToken(req)) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const { database_name, table_name, sql_filter, limit = 5 } = JSON.parse(body || '{}')
    // Resolve database name (fallback to environment variable if not provided)
    const db = database_name || process.env.TIDB_DB || process.env.TIDB_DATABASE || ''
    // Validate required fields
    if (!db || !table_name) {
      return res.status(400).json({ error: 'Missing database_name or table_name' })
    }
    // Build optional WHERE clause
    const where = sql_filter ? `WHERE ${sql_filter}` : ''
    // Build SQL query using backtick-quoted identifiers and numeric limit
    const sql = `SELECT * FROM \`${db}\`.\`${table_name}\` ${where} LIMIT ${Number(limit)}`
    const rows = await query<any>(sql)
    res.status(200).json({ rows })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
