import fs from 'fs';
import path from 'path';
import type { Pool, PoolOptions, RowDataPacket } from 'mysql2/promise';
import mysql from 'mysql2/promise';
import type { Product, SitemapProduct } from './types';

let pool: Pool | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name] ?? '';
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

function getSslConfig() {
  const caRaw = process.env.TIDB_SSL_CA?.trim();
  if (!caRaw) return undefined;
  if (caRaw.includes('-----BEGIN')) {
    return { ca: caRaw };
  }
  try {
    const filePath = path.resolve(caRaw);
    const caFromFile = fs.readFileSync(filePath, 'utf8');
    if (caFromFile) {
      return { ca: caFromFile };
    }
  } catch (error) {
    console.warn('TiDB SSL CA file not found, falling back to inline value.');
  }
  return { ca: caRaw };
}

function createPool(): Pool {
  const config: PoolOptions = {
    host: process.env.TIDB_HOST || process.env.TIDB_SERVER_HOST || '127.0.0.1',
    port: Number(process.env.TIDB_PORT || process.env.TIDB_SERVER_PORT || 4000),
    user:
      process.env.TIDB_USER ||
      process.env.TIDB_USERNAME ||
      process.env.TIDB_DB_USER ||
      requiredEnv('TIDB_USER'),
    password:
      process.env.TIDB_PASS ||
      process.env.TIDB_PASSWORD ||
      process.env.TIDB_DB_PASSWORD ||
      requiredEnv('TIDB_PASSWORD'),
    database:
      process.env.TIDB_DB ||
      process.env.TIDB_DATABASE ||
      process.env.TIDB_DB_NAME ||
      requiredEnv('TIDB_DATABASE'),
    waitForConnections: true,
    connectionLimit: Number(process.env.TIDB_POOL_LIMIT || 8),
    queueLimit: 0,
    timezone: 'Z',
    decimalNumbers: true,
    ssl: getSslConfig(),
  };
  return mysql.createPool(config);
}

function getPool(): Pool {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

type ProductRow = Product & RowDataPacket;

type SitemapRow = {
  slug: string;
  lastmod: string | Date | null;
} & RowDataPacket;

function coerceJsonField<T>(value: unknown): T | undefined {
  if (value == null) return undefined;
  if (typeof value === 'object') return (value as unknown) as T;
  if (typeof value === 'string' && value.trim()) {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn('Failed to parse JSON field', error);
    }
  }
  return undefined;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [rows] = await getPool().execute<ProductRow[]>(
    `SELECT id, slug, name, title_h1, brand, model, sku, images_json, desc_html, short_summary, meta_description,
            mdx_body, mdx_frontmatter_json, mdx_updated_at, cta_lead_url, cta_stripe_url,
            cta_affiliate_url, cta_paypal_url, is_published, last_tidb_update_at
       FROM products
       WHERE slug = ?
       LIMIT 1`,
    [slug],
  );
  if (!rows.length) {
    return null;
  }
  const product = rows[0];
  if (!product.name) {
    (product as Product).name = product.slug;
  }
  const frontmatter = coerceJsonField<unknown>(product.mdx_frontmatter_json);
  return { ...product, mdx_frontmatter_json: frontmatter };
}

export async function iterPublishedForSitemaps(
  offset: number,
  limit: number,
): Promise<SitemapProduct[]> {
  const [rows] = await getPool().execute<SitemapRow[]>(
    `SELECT slug,
            DATE_FORMAT(GREATEST(COALESCE(last_tidb_update_at, '1970-01-01'), COALESCE(mdx_updated_at, '1970-01-01')), '%Y-%m-%dT%H:%i:%sZ') AS lastmod
       FROM products
       WHERE is_published = 1
       ORDER BY slug
       LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows
    .filter((row) => Boolean(row.slug))
    .map((row) => ({ slug: row.slug, lastmod: row.lastmod ? String(row.lastmod) : new Date().toISOString() }));
}

export async function updateProduct(id: number, patch: Partial<Product>): Promise<void> {
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
  if (!entries.length) return;
  const columns = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  await getPool().execute(`UPDATE products SET ${columns} WHERE id = ?`, [...values, id]);
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

export async function closeDbPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export type { Product } from './types';
