import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../lib/db';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const urls: string[] = [
    `${host}/`,
    `${host}/categories`,
    `${host}/blog`,
    `${host}/privacy`,
    `${host}/terms`,
    `${host}/cookies`,
  ];

  try {
    const [cats] = await pool.query(
      `SELECT DISTINCT COALESCE(category_slug,'uncategorized') AS slug
       FROM products WHERE category_slug IS NOT NULL`
    );
    for (const row of cats as any[]) {
      urls.push(`${host}/category/${encodeURIComponent(row.slug)}`);
    }

    const [prods] = await pool.query(`SELECT slug FROM products WHERE slug IS NOT NULL`);
    for (const row of prods as any[]) {
      urls.push(`${host}/product/${encodeURIComponent(row.slug)}`);
    }
  } catch {
    // if DB not reachable, still emit a minimal sitemap
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(body);
}
