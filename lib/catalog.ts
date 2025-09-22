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

/**
 * BÚSQUEDA: case-insensitive, tokenizada (AND entre tokens, OR entre columnas).
 * Corrige comillas vacías para MySQL/TiDB: usar '' (no "").
 */
export async function searchProducts(term: string, limit = 30): Promise<Product[]> {
  const base = norm(term);
  if (!base) return [];

  const tokens = base.split(/\s+/).filter(Boolean).slice(0, 5);

  const columns = [
    'LOWER(name)',
    'LOWER(description)',
    'LOWER(slug)',
    "LOWER(COALESCE(category_name, ''))",
    "LOWER(COALESCE(category_slug, ''))",
  ];

  const whereParts: string[] = [];
  const params: any[] = [];

  for (const t of tokens) {
    const like = `%${t}%`;
    whereParts.push(`(${columns.map((c) => `${c} LIKE ?`).join(' OR ')})`);
    // push same like for each column in this token
    for (let i = 0; i < columns.length; i++) params.push(like);
  }

  const sql = `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    ${whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : ''}
    ORDER BY id DESC
    LIMIT ?
  `;
  params.push(limit);

  return query<Product>(sql, params);
}


