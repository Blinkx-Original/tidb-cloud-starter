import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const urls: string[] = [
    `${host}/`,
    `${host}/categories`,
    `${host}/blog`,
    `${host}/privacy`,
    `${host}/terms`,
    `${host}/cookies`
  ];

  try {
    // Import dinámico evita que Webpack intente meter mysql2 en el bundle del cliente
    const { query } = await import('../../lib/db');

    const cats = await query<{ slug: string }>(
      `SELECT DISTINCT COALESCE(category_slug,'uncategorized') AS slug
       FROM products WHERE category_slug IS NOT NULL`
    );
    for (const row of cats) {
      urls.push(`${host}/category/${encodeURIComponent(row.slug)}`);
    }

    const prods = await query<{ slug: string }>(
      `SELECT slug
       FROM products
       WHERE slug IS NOT NULL`
    );
    for (const row of prods) {
      urls.push(`${host}/product/${encodeURIComponent(row.slug)}`);
    }
  } catch {
    // Si falla la DB, devolvemos un sitemap mínimo y NO rompemos build/runtime
  }

  const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.status(200).send(xml);
}
