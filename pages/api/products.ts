import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
    const pageSizeRaw = parseInt(String(req.query.pageSize || '12'), 10) || 12;
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 60); // cap to avoid abuse
    const offset = (page - 1) * pageSize;

    const [items] = await pool.query(
      `SELECT id, sku, name, slug, image_url, price_eur, price, category_name, category_slug, description
       FROM products
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    const [[{ total }]]: any = await pool.query(`SELECT COUNT(*) AS total FROM products`);

    res.status(200).json({ items, page, pageSize, total });
  } catch (e: any) {
    res.status(500).json({ error: 'products_api_error', message: e?.message || 'Unknown error' });
  }
}
