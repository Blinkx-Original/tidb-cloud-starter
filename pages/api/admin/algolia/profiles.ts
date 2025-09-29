import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin_auth'
import { query } from '@/lib/dbClient'

/*
 * Profiles API
 * GET: returns all Algolia profiles
 * POST: create or update a profile
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  // Ensure tables exist (idempotent)
  await ensureTables()
  if (req.method === 'GET') {
    const profiles = await query<any>(
      'SELECT profile_key, name, database_name, table_name, primary_key, updated_at_col, algolia_index, object_id_prefix, sql_filter, base_url_template FROM admin_algolia_profiles'
    )
    res.status(200).json({ profiles })
  } else if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      const {
        profile_key,
        name,
        database_name,
        table_name,
        primary_key,
        updated_at_col,
        algolia_index,
        object_id_prefix,
        sql_filter,
        base_url_template,
      } = JSON.parse(body || '{}')
      if (!profile_key || !table_name || !primary_key || !algolia_index) {
        return res.status(400).json({ error: 'Missing required fields: profile_key, table_name, primary_key, algolia_index' })
      }
      // Upsert profile
      await query(
        `REPLACE INTO admin_algolia_profiles
          (profile_key, name, database_name, table_name, primary_key, updated_at_col, algolia_index, object_id_prefix, sql_filter, base_url_template)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile_key,
          name || profile_key,
          database_name || null,
          table_name,
          primary_key,
          updated_at_col || null,
          algolia_index,
          object_id_prefix || null,
          sql_filter || null,
          base_url_template || null,
        ]
      )
      return res.status(200).json({ ok: true })
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function ensureTables() {
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
}
