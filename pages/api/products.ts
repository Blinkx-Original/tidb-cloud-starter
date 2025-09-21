// pages/api/products.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';

type ProductRow = {
  id: number;
  sku: string | null;
  name: string;
  slug: string;
  image_url: string | null;
  price_eur: number | null;
  price: number | null;
  category_name: string | null;
  category_slug: string | null;
  description: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawPage = String(req.query.page ?? '1');
    const rawPageSize = String(req.query.pageSize ?? '24');

    const page = Math.max(parseInt(rawPage, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(rawPageSize, 10) || 24, 1), 100);
    const offset = (page - 1) * pageSize;

    const items = await query<ProductRow>(
      `
      SELECT id, sku, name, slug, image_url, price_eur, price, category_name, category_slug, description
      FROM products
      ORDER BY id ASC
      LIMIT ? OFFSET ?
      `,
      [pageSize, offset]
    );

    const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM products`);

    return res.status(200).json({
      page,
      pageSize,
      total,
      items,
    });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
