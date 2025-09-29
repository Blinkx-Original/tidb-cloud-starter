import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin_auth'
import { query } from '@/lib/dbClient'
import { algoliaClient } from '@/lib/algoliaClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminToken(req)) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const { profile_key } = JSON.parse(body || '{}')
    if (!profile_key) return res.status(400).json({ error: 'Missing profile_key' })
    await query(
      `CREATE TABLE IF NOT EXISTS admin_algolia_profiles (
        profile_key VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        database_name VARCHAR(255),
        table_name VARCHAR(255) NOT NULL,
        primary_key VARCHAR(255) NOT NULL,
        updated_at_col VARCHAR(255),
        algolia_index VARCHAR(255) NOT NULL,
        object_id_prefix VARCHAR(255),
        sql_filter TEXT,
        base_url_template VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    )
    const profiles = await query<any>(
      `SELECT * FROM admin_algolia_profiles WHERE profile_key = ? LIMIT 1`,
      [profile_key]
    )
    const profile = profiles[0]
    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    const db = profile.database_name || process.env.TIDB_DB || process.env.TIDB_DATABASE
    if (!db) return res.status(500).json({ error: 'Missing database name in profile or env' })
    const table = profile.table_name
    const pk = profile.primary_key
    const filter = profile.sql_filter ? `WHERE ${profile.sql_filter}` : ''
    const sql = `SELECT * FROM \`${db}\`.\`${table}\` ${filter}`
    const rows = await query<any>(sql)
    const records = rows.map((row: any) => {
      const objectID = `${profile.object_id_prefix || ''}${row[pk]}`
      let url = ''
      if (profile.base_url_template) {
        url = profile.base_url_template.replace(/\{\{(.*?)\}\}/g, (_m: string, g: string) => {
          const key = g.trim()
          return row[key] || ''
        })
      }
      return { objectID, url, ...row }
    })
    const indexName = profile.algolia_index
    const index = algoliaClient.initIndex(indexName)
    await index.saveObjects(records, { autoGenerateObjectIDIfNotExist: false })
    res.status(200).json({ ok: true, count: records.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
