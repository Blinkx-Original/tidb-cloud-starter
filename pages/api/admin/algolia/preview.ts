import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/dbClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hdr = (req.headers['x-admin-token'] || req.headers['X-Admin-Token']) as string | undefined
  if (!process.env.INDEX_ADMIN_TOKEN) return res.status(500).json({ error: 'INDEX_ADMIN_TOKEN missing' })
  if (!hdr || hdr !== process.env.INDEX_ADMIN_TOKEN) return res.status(401).json({ error: 'UNAUTHORIZED' })

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { database_name, table_name, sql_filter, limit } = req.body || {}
    if (!table_name) return res.status(400).json({ error: 'Missing table_name' })

    const db = (database_name || process.env.TIDB_DB || process.env.TIDB_DATABASE || '').trim()
    if (!db) return res.status(400).json({ error: 'Missing database_name' })

    const ident = (s: string) => {
      if (!/^[a-zA-Z0-9_]+$/.test(s)) throw new Error('Invalid identifier')
      return s
    }

    const dbName = ident(db)
    const table = ident(String(table_name))

    const where = (sql_filter && String(sql_filter).trim()) ? ` WHERE ${String(sql_filter).trim()}` : ''
    const lim = Math.max(1, Math.min(50, Number(limit) || 3))
    const sql = `SELECT * FROM \`${dbName}\`.\`${table}\`${where} LIMIT ${lim}`

    const rows = await query<any[]>(sql)
    return res.status(200).json({ ok: true, rows })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
