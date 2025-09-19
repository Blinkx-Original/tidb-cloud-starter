import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || '20'), 10), 1), 100);
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(
      `SELECT id, sku, name, slug, description, price_eur, price, image_url, category_name, category_slug
       FROM products
       ORDER BY id
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM products`);
    const total = (countRows as any)[0].total as number;

    res.status(200).json({ items: rows, total, page, pageSize });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'products_api_error', message: e?.message || 'Unknown error' });
  }
}
