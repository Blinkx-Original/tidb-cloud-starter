// pages/api/categories.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db'; // usa el helper tipado

type CategoryRow = {
  slug: string;
  name: string;
  count: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const raw = String(req.query.limit ?? '24');
    const n = Number.parseInt(raw, 10);
    const limit = Math.min(Math.max(Number.isFinite(n) ? n : 24, 10), 200); // entre 10 y 200

    const rows = await query<CategoryRow>(
      `
      SELECT
        COALESCE(category_slug, 'uncategorized') AS slug,
        COALESCE(category_name, 'Uncategorized') AS name,
        COUNT(*) AS count
      FROM products
      GROUP BY slug, name
      ORDER BY count DESC, name ASC
      LIMIT ?
      `,
      [limit]
    );

    return res.status(200).json({ categories: rows });
  } catch (err) {
    console.error('GET /api/categories error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
