// lib/catalog.ts
import { query } from './db';
import type { Product } from './db';

/**
 * Búsqueda simple: busca en name, description, slug y categoría.
 * Case-insensitive y usando LIKE con wildcards.
 */
export async function searchProducts(term: string, limit = 30): Promise<Product[]> {
  const q = (term || '').trim();
  if (!q) return [];

  const like = `%${q.toLowerCase()}%`;

  return query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price,
           description, category_name, category_slug
    FROM products
    WHERE LOWER(name) LIKE ?
       OR LOWER(description) LIKE ?
       OR LOWER(slug) LIKE ?
       OR LOWER(COALESCE(category_name, '')) LIKE ?
       OR LOWER(COALESCE(category_slug, '')) LIKE ?
    ORDER BY id DESC
    LIMIT ?
    `,
    [like, like, like, like, like, limit]
  );
}


