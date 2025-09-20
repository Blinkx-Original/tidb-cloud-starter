import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '24'), 10), 1), 200);
    const [rows] = await pool.query(
      `SELECT
         COALESCE(category_slug, 'uncategorized') AS slug,
         COALESCE(category_name, 'Uncategorized') AS name,
         COUNT(*) AS count
       FROM products
       GROUP BY category_slug, category_name
       ORDER BY count DESC, name ASC
       LIMIT ?`,
      [limit]
    );
    res.status(200).json({ items: rows });
  } catch (e: any) {
    res.status(500).json({ error: 'categories_api_error', message: e?.message || 'Unknown error' });
  }
}
