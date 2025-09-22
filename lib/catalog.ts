// lib/catalog.ts
import { query } from './db';
import type { Product } from './db';

/**
 * Devuelve un producto por slug único
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await query<Product>(
    `
    SELECT id, sku, name, slug, image_url, price_eur, price,
           category_name, category_slug, description
    FROM products
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Devuelve todos los productos de una categoría
 */
export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  return await query<Product>(
    `
    SELECT id, sku, name, slug, image_url, price_eur, price,
           category_name, category_slug, description
    FROM products
    WHERE category_slug = ?
    ORDER BY id ASC
    `,
    [slug]
  );
}

/**
 * Devuelve todas las categorías distintas (slug + name)
 */
export async function getAllCategories(): Promise<{ slug: string; name: string }[]> {
  return await query<{ slug: string; name: string }>(
    `
    SELECT DISTINCT
      COALESCE(category_slug, 'uncategorized') AS slug,
      COALESCE(category_name, 'Uncategorized') AS name
    FROM products
    ORDER BY name ASC
    `
  );
}
