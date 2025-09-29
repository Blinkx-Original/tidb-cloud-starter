import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * verifyAdminToken checks for the X-Admin-Token header and compares it against
 * the INDEX_ADMIN_TOKEN environment variable. Returns true if valid.
 */
export function verifyAdminToken(req: NextApiRequest): boolean {
  const token = (req.headers['x-admin-token'] || req.headers['X-Admin-Token']) as string | undefined
  const secret = process.env.INDEX_ADMIN_TOKEN
  if (!secret) return false
  return token === secret
}
