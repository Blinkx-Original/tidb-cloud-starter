import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin_auth'
import { query } from '@/lib/dbClient'
import { algoliaClient } from '@/lib/algoliaClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminToken(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const result: any = { ok: true, checks: {} }
  // ping TiDB (basic SELECT)
  try {
    await query('SELECT 1')
    result.checks.tidb = { ok: true }
  } catch (err: any) {
    result.ok = false
    result.checks.tidb = { ok: false, error: err.message }
  }
  // ping Algolia
  try {
    const indices = await algoliaClient.listIndices()
    result.checks.algolia = { ok: true, count: indices.items.length }
  } catch (err: any) {
    result.ok = false
    result.checks.algolia = { ok: false, error: err.message }
  }
  res.status(result.ok ? 200 : 500).json(result)
}
