import type { NextApiRequest, NextApiResponse } from 'next';
export function checkAuth(req: NextApiRequest, res: NextApiResponse) {
  const token = (req.headers['x-admin-token'] || req.query.key) as string | undefined;
  if (!token || token !== process.env.INDEX_ADMIN_TOKEN) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}
