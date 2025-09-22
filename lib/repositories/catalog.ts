// lib/repositories/catalog.ts
import { query } from '@/lib/dbClient';
import type { Product, Category } from '@/lib/domain';

export const CatalogRepo = {
  async getAllCategories(): Promise<Category[]> {
    const rows = await query<{ category_name: string | null; category_slug: string | null; count: number }>(
      `SELECT category_name, category_slug, COUNT(*) as count
       FROM products
       WHERE category_slug IS NOT NULL
       GROUP BY category_name, category_slug
       ORDER BY category_name ASC`
    );
    return rows.map(r => ({
      name: r.category_name ?? 'Uncategorized',
      slug: r.category_slug ?? 'uncategorized',
      count: r.count,
    }));
  },

  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    return await query<Product>(
      `SELECT id, name, slug, image_url, price_eur, description, category_name, category_slug
       FROM products
       WHERE category_slug = ?
       ORDER BY id DESC`,
      [slug]
    );
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const rows = await query<Product>(
      `SELECT id, name, slug, image_url, price_eur, description, category_name, category_slug
       FROM products
       WHERE slug = ?
       LIMIT 1`,
      [slug]
    );
    return rows[0] ?? null;
  },

  // --------- CASE-INSENSITIVE SEARCH (LIKE con LOWER) ----------
  async searchProducts(q: string): Promise<Product[]> {
    const trimmed = (q || '').trim();
    if (!trimmed) return [];

    const term = `%${trimmed.toLowerCase()}%`;
    return await query<Product>(
      `SELECT id, name, slug, image_url, price_eur, description, category_name, category_slug
       FROM products
       WHERE
         (name IS NOT NULL AND LOWER(name) LIKE ?)
         OR (description IS NOT NULL AND LOWER(description) LIKE ?)
       ORDER BY id DESC
       LIMIT 100`,
      [term, term]
    );
  },

  async getRecentProducts(limit = 24): Promise<Product[]> {
    return await query<Product>(
      `SELECT id, name, slug, image_url, price_eur, description, category_name, category_slug
       FROM products
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );
  },
};
