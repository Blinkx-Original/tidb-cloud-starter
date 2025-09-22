// lib/catalog.ts (solo esta función)
import type { Product } from './db';
import { query } from './db';

/**
 * Búsqueda estable (case-insensitive), sin LIMIT parametrizado
 * y evitando NULLs con IFNULL.
 */
export async function searchProducts(term: string, limit = 30): Promise<Product[]> {
  const q = String(term || '').trim();
  if (!q) return [];

  // usamos el mismo patrón para todas las columnas en minúscula
  const like = `%${q.toLowerCase()}%`;

  const sql = `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    WHERE
      LOWER(IFNULL(name, '')) LIKE ?
      OR LOWER(IFNULL(description, '')) LIKE ?
      OR LOWER(IFNULL(slug, '')) LIKE ?
      OR LOWER(IFNULL(category_name, '')) LIKE ?
      OR LOWER(IFNULL(category_slug, '')) LIKE ?
    ORDER BY id DESC
    LIMIT 30
  `; // 👈 LIMIT fijo para evitar fallos de prepared statements

  return query<Product>(sql, [like, like, like, like, like]);
}
