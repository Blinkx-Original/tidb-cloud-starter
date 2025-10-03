import slugify from 'slugify';
import { ProductDTO, TiDBProductRow } from './types';

const urlBase = () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (!base) {
    throw new Error('Missing NEXT_PUBLIC_SITE_URL environment variable');
  }
  return base.replace(/\/$/, '');
};

function coerceDate(value: Date | string | null | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function normalizeCategories(raw: string | null): string[] | undefined {
  const arr = safeJsonParse(raw, [] as unknown[]);
  if (!Array.isArray(arr)) return undefined;
  const normalized = arr
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
  return normalized.length ? normalized : undefined;
}

function normalizeAttributes(
  raw: string | null,
): Record<string, string | number | boolean> | undefined {
  const obj = safeJsonParse<Record<string, unknown>>(raw, {});
  if (!obj || typeof obj !== 'object') return undefined;
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(obj)) {
    const trimmedKey = key.trim();
    if (!trimmedKey) continue;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      result[trimmedKey] = value;
    } else if (value != null) {
      result[trimmedKey] = JSON.stringify(value);
    }
  }
  return Object.keys(result).length ? result : undefined;
}

function normalizeImages(raw: string | null): string[] | undefined {
  const arr = safeJsonParse(raw, [] as unknown[]);
  if (!Array.isArray(arr)) return undefined;
  const normalized = arr
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
  return normalized.length ? normalized : undefined;
}

export type TransformResult = {
  product: ProductDTO;
  warnings: string[];
};

export function ensureSlug(name: string | null | undefined, slug: string | null | undefined, id: number): string {
  if (slug && slug.trim()) return slug.trim();
  const basis = name && name.trim() ? name : `product-${id}`;
  return slugify(basis, { lower: true, strict: true });
}

export function transformRow(row: TiDBProductRow): TransformResult {
  const warnings: string[] = [];
  const slug = ensureSlug(row.name, row.slug, row.id);
  if (!row.slug) {
    warnings.push(`Generated slug "${slug}" for product ${row.id}`);
  }

  const sku = (row.sku || '').trim();
  const objectID = sku || String(row.id);
  if (!sku) {
    warnings.push(`Missing SKU for product ${row.id}. Using id as objectID.`);
  }

  const updatedAt = coerceDate(row.updated_at);
  const product: ProductDTO = {
    objectID,
    sku: sku || String(row.id),
    slug,
    url: `${urlBase()}/p/${slug}`,
    name: row.name || `Producto ${row.id}`,
    brand: row.brand?.trim() || undefined,
    shortDescription: row.short_description || undefined,
    longDescription: row.long_description || undefined,
    price: typeof row.price === 'number' ? row.price : undefined,
    currency: row.currency?.trim() || undefined,
    categories: normalizeCategories(row.categories),
    attributes: normalizeAttributes(row.attributes),
    images: normalizeImages(row.images),
    isPublished: Number(row.is_published ?? 0) === 1,
    stockQty: typeof row.stock_qty === 'number' ? row.stock_qty : undefined,
    stockStatus: ((): ProductDTO['stockStatus'] => {
      const status = (row.stock_status || '').toLowerCase();
      if (status === 'instock' || status === 'outofstock' || status === 'onbackorder') {
        return status;
      }
      return undefined;
    })(),
    updatedAt: updatedAt.toISOString(),
  };

  if (!product.stockStatus && product.isPublished) {
    product.stockStatus = product.stockQty && product.stockQty > 0 ? 'instock' : 'outofstock';
  }

  if (!product.price) {
    warnings.push(`Product ${row.id} has no price. It will be indexed without price.`);
  }

  return { product, warnings };
}
