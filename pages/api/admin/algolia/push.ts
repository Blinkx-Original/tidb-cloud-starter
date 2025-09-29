import type { NextApiRequest, NextApiResponse } from 'next'
import algoliasearch from 'algoliasearch'
import { query } from '@/lib/dbClient'

type Profile = {
  profile_key: string
  database_name?: string
  table_name: string
  primary_key: string
  algolia_index: string
  object_id_prefix?: string | null
  sql_filter?: string | null
  base_url_template?: string | null
}

type Mapping = {
  profile_key: string
  column_name: string
  algolia_attr: string
  include_flag: number
  json_array: number
}

const ident = (s: string) => {
  if (!/^[a-zA-Z0-9_]+$/.test(s)) throw new Error('Invalid identifier')
  return s
}

function applyTemplate(tpl: string | null | undefined, row: Record<string, any>) {
  if (!tpl) return undefined
  return tpl.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, k) => {
    const v = (row as any)[k]
    return v == null ? '' : String(v)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hdr = (req.headers['x-admin-token'] || req.headers['X-Admin-Token']) as string | undefined
  if (!process.env.INDEX_ADMIN_TOKEN) return res.status(500).json({ error: 'INDEX_ADMIN_TOKEN missing' })
  if (!hdr || hdr !== process.env.INDEX_ADMIN_TOKEN) return res.status(401).json({ error: 'UNAUTHORIZED' })

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { profile_key } = req.body || {}
    if (!profile_key) return res.status(400).json({ error: 'Missing profile_key' })

    const rowsP = await query<Profile[]>(
      'SELECT * FROM admin_algolia_profiles WHERE profile_key=? LIMIT 1',
      [profile_key]
    )
    const profile = rowsP[0]
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const db = ident((profile.database_name || process.env.TIDB_DB || process.env.TIDB_DATABASE || '').trim())
    const table = ident(profile.table_name)
    const pk = ident(profile.primary_key)

    const mappings = await query<Mapping[]>(
      'SELECT * FROM admin_algolia_mappings WHERE profile_key=?',
      [profile_key]
    )

    const where = (profile.sql_filter && profile.sql_filter.trim()) ? ` WHERE ${profile.sql_filter.trim()}` : ''
    const sql = `SELECT * FROM \`${db}\`.\`${table}\`${where}`

    const rows = await query<any[]>(sql)
    if (!rows.length) return res.status(200).json({ ok: true, count: 0 })

    const include = new Map<string, { attr: string, json: boolean }>()
    for (const m of (mappings || [])) {
      if (m.include_flag) include.set(m.column_name, { attr: m.algolia_attr || m.column_name, json: !!m.json_array })
    }
    const useMapping = include.size > 0

    const objects = rows.map((r) => {
      const obj: any = {}
      if (useMapping) {
        for (const [col, { attr, json }] of include) {
          const v = (r as any)[col]
          obj[attr] = json && typeof v === 'string' ? tryParseJSON(v) : v
        }
      } else {
        Object.assign(obj, r)
      }
      obj.objectID = `${profile.object_id_prefix || ''}${(r as any)[pk]}`
      const url = applyTemplate(profile.base_url_template || null, r)
      if (url) obj.url = url
      return obj
    })

    const appId = process.env.ALGOLIA_APP_ID
    const adminKey = process.env.ALGOLIA_ADMIN_KEY
    if (!appId || !adminKey) return res.status(500).json({ error: 'ALGOLIA_APP_ID / ALGOLIA_ADMIN_KEY missing' })

    const client = algoliasearch(appId, adminKey)
    const indexName = `${profile.algolia_index}${process.env.ALGOLIA_INDEX_SUFFIX || ''}`
    const index = client.initIndex(indexName)

    await index.saveObjects(objects, { autoGenerateObjectIDIfNotExist: false } as any)

    return res.status(200).json({ ok: true, count: objects.length })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}

function tryParseJSON(s: any) {
  if (typeof s !== 'string') return s
  try { return JSON.parse(s) } catch { return s }
}
