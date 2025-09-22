// lib/catalog.ts
import { query } from './db';
import type { Product } from './db';

export type CategorySummary = {
  slug: string;
  name: string;
  count: number;
};

function norm(s: string) {
  return decodeURIComponent(String(s || '')).trim().toLowerCase();
}

/* ---------- CATEGORIES ---------- */
export async function getPopularCategories(limit = 12): Promise<CategorySummary[]> {
  return query<CategorySummary>(
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
}

export async function getAllCategories(limit = 100): Promise<CategorySummary[]> {
  return query<CategorySummary>(
    `
    SELECT
      COALESCE(category_slug, 'uncategorized') AS slug,
      COALESCE(category_name, 'Uncategorized') AS name,
      COUNT(*) AS count
    FROM products
    GROUP BY slug, name
    ORDER BY name ASC
    LIMIT ?
    `,
    [limit]
  );
}

export async function getProductsByCategorySlug(categorySlug: string, limit = 120): Promise<Product[]> {
  const s = norm(categorySlug) || 'uncategorized';
  return query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    WHERE LOWER(TRIM(COALESCE(category_slug, 'uncategorized'))) = LOWER(TRIM(?))
    ORDER BY id DESC
    LIMIT ?
    `,
    [s, limit]
  );
}

/* ---------- PRODUCTS ---------- */
export async function getLatestProducts(limit = 12): Promise<Product[]> {
  return query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    ORDER BY id DESC
    LIMIT ?
    `,
    [limit]
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const s = norm(slug);
  const rows = await query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    WHERE LOWER(TRIM(slug)) = LOWER(TRIM(?))
    LIMIT 1
    `,
    [s]
  );
  return rows[0] ?? null;
}

/* ---------- SEARCH ---------- */
/**
 * Búsqueda simple, estable (case-insensitive) en varias columnas.
 */
export async function searchProducts(term: string, limit = 30): Promise<Product[]> {
  const q = (term || '').trim();
  if (!q) return [];

  const like = `%${q.toLowerCase()}%`;

  return query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
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

