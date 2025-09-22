// lib/repositories/catalog.ts
import { query } from '@/lib/dbClient';
import type { Product, Category } from '@/lib/domain';

const baseSelect = `
  SELECT id, name, slug, image_url, price_eur, description, category_name, category_slug
  FROM products
`;

export const CatalogRepo = {
  async getAllCategories(): Promise<Category[]> {
    const rows = await query<{ category_name: string | null; category_slug: string | null; count: number }>(
      `SELECT category_name, category_slug, COUNT(*) as count
       FROM products
       WHERE category_slug IS NOT NULL
       GROUP BY category_name, category_slug
       ORDER BY category_name ASC`
    );
    return rows.map((r) => ({
      name: r.category_name ?? 'Uncategorized',
      slug: r.category_slug ?? 'uncategorized',
      count: r.count,
    }));
  },

  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    return await query<Product>(
      `${baseSelect}
       WHERE category_slug = ?
       ORDER BY id DESC`,
      [slug]
    );
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const rows = await query<Product>(
      `${baseSelect}
       WHERE slug = ?
       LIMIT 1`,
      [slug]
    );
    return rows[0] ?? null;
  },

  /**
   * BÚSQUEDA GRANDE, CASE-INSENSITIVE y con ÍNDICE:
   * - Usa columnas generadas: name_lower / description_lower
   * - UNION para permitir uso del índice en name_lower
   * - DISTINCT implícito en UNION evita duplicados si coincide en ambos campos
   */
  async searchProducts(q: string): Promise<Product[]> {
    const trimmed = (q || '').trim().toLowerCase();
    if (!trimmed) return [];

    const term = `%${trimmed}%`;

    // 1) Coincidencias por nombre (usa idx_products_name_lower)
    // 2) Coincidencias por descripción (puede usar prefijo si lo creaste)
    // UNION deduplica; luego ordenamos por id desc y limitamos
    const sql = `
      ${baseSelect}
      WHERE name_lower LIKE ?
      UNION
      ${baseSelect}
      WHERE description_lower LIKE ?
      ORDER BY id DESC
      LIMIT 100
    `;

    const rows = await query<Product>(sql, [term, term]);
    return rows;
  },

  async getRecentProducts(limit = 24): Promise<Product[]> {
    return await query<Product>(
      `${baseSelect}
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );
  },
};

