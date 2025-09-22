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

/* ===================== CATEGORIES ===================== */

export async function getPopularCategories(limit = 12): Promise<CategorySummary[]> {
  // LIMIT parametrizado es seguro aquí; si tuvieras issues, fija el número.
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
    [Math.max(1, Math.min(Number(limit) || 12, 500))]
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
    [Math.max(1, Math.min(Number(limit) || 100, 1000))]
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
    [s, Math.max(1, Math.min(Number(limit) || 120, 500))]
  );
}

/* ======================= PRODUCTS ====================== */

export async function getLatestProducts(limit = 12): Promise<Product[]> {
  return query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    ORDER BY id DESC
    LIMIT ?
    `,
    [Math.max(1, Math.min(Number(limit) || 12, 200))]
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

/* ======================== SEARCH ======================= */
/**
 * Búsqueda estable (case-insensitive) en múltiples columnas.
 * Evita NULLs con IFNULL y usa LIMIT fijo para prevenir issues de prepared statements.
 */
export async function searchProducts(term: string, _limit = 30): Promise<Product[]> {
  const q = String(term || '').trim();
  if (!q) return [];

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
  `;

  // 5 placeholders para LIKE; LIMIT es literal.
  return query<Product>(sql, [like, like, like, like, like]);
}
