import axios, { AxiosInstance } from 'axios';
import { fetchProductsSince, readCheckpoint, writeCheckpoint } from './tidb';
import { transformRow } from './transform';
import { createLog, finalizeLog, fetchLatestLog, toSummary } from './log';
import { ProductDTO, SyncSummary } from './types';
import { sanitizeRichText } from './html';

const DEFAULT_BATCH_SIZE = 250;
const DEFAULT_MAX_DURATION = 10 * 60 * 1000;

type RunOptions = {
  batchSize?: number;
  maxDurationMs?: number;
  triggeredBy?: 'manual' | 'cron';
};

type WooProduct = {
  id: number;
};

type WooCategory = {
  id: number;
  name: string;
};

function env(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value.trim();
}

function createClient(): AxiosInstance {
  const baseUrl = env('WOO_BASE_URL');
  const key = env('WOO_CONSUMER_KEY');
  const secret = env('WOO_CONSUMER_SECRET');
  const version = process.env.WOO_VERSION?.trim() || 'v3';
  return axios.create({
    baseURL: `${baseUrl.replace(/\/$/, '')}/wp-json/wc/${version}`,
    auth: { username: key, password: secret },
    timeout: 60000,
  });
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
  try {
    const result = await fn();
    await delay(220); // throttle ~4.5 req/s
    return result;
  } catch (error: any) {
    const status = error?.response?.status;
    if ((status === 429 || status >= 500) && attempt < 5) {
      const wait = 500 * Math.pow(2, attempt);
      await delay(wait);
      return requestWithRetry(fn, attempt + 1);
    }
    throw error;
  }
}

async function findProductBySku(client: AxiosInstance, sku: string): Promise<WooProduct | null> {
  const res = await requestWithRetry(() =>
    client.get('/products', { params: { sku, per_page: 1 } }),
  );
  const data = res.data as WooProduct[];
  return data[0] || null;
}

const categoryCache = new Map<string, WooCategory>();

async function ensureCategory(client: AxiosInstance, name: string): Promise<WooCategory> {
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    throw new Error('Cannot ensure category without name');
  }
  if (categoryCache.has(normalized)) {
    return categoryCache.get(normalized)!;
  }
  const res = await requestWithRetry(() =>
    client.get('/products/categories', { params: { search: name, per_page: 100 } }),
  );
  const candidates = (res.data as WooCategory[]).filter(
    (cat) => cat.name.trim().toLowerCase() === normalized,
  );
  if (candidates.length) {
    const cat = candidates[0];
    categoryCache.set(normalized, cat);
    return cat;
  }
  const created = await requestWithRetry(() =>
    client.post('/products/categories', { name }),
  );
  const category = created.data as WooCategory;
  categoryCache.set(normalized, category);
  return category;
}

async function ensureCategories(client: AxiosInstance, names: string[] | undefined): Promise<WooCategory[]> {
  if (!names || !names.length) return [];
  const categories: WooCategory[] = [];
  for (const name of names) {
    const cat = await ensureCategory(client, name);
    categories.push(cat);
  }
  return categories;
}

function mapProductToPayload(product: ProductDTO, categories: WooCategory[]) {
  const metaData: { key: string; value: string }[] = [];
  if (product.brand) {
    metaData.push({ key: 'brand', value: product.brand });
  }
  if (product.attributes) {
    metaData.push({ key: 'attributes_json', value: JSON.stringify(product.attributes) });
  }

  const sanitizedLong = sanitizeRichText(product.longDescription);
  const sanitizedShort = sanitizeRichText(product.shortDescription);

  const images = Array.from(new Set(product.images || [])).map((src) => ({ src }));

  const payload: Record<string, any> = {
    name: product.name,
    slug: product.slug,
    type: 'simple',
    status: product.isPublished ? 'publish' : 'draft',
    sku: product.sku,
    categories: categories.map((cat) => ({ id: cat.id })),
    images,
    stock_status: product.stockStatus || 'outofstock',
    meta_data: metaData,
  };

  if (typeof product.price === 'number') {
    payload.regular_price = product.price.toFixed(2);
  }
  if (sanitizedLong) {
    payload.description = sanitizedLong;
  }
  if (sanitizedShort) {
    payload.short_description = sanitizedShort;
  }
  if (typeof product.stockQty === 'number') {
    payload.manage_stock = true;
    payload.stock_quantity = product.stockQty;
  } else {
    payload.manage_stock = false;
  }

  return payload;
}

export async function runWooSync(options: RunOptions = {}): Promise<SyncSummary> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const maxDuration = options.maxDurationMs ?? DEFAULT_MAX_DURATION;
  const client = createClient();

  const logId = await createLog('woo');
  const startedAt = new Date();
  let ok = 0;
  let failed = 0;
  const warnings: string[] = [];
  const errors: string[] = [];
  const checkpoint = await readCheckpoint('woo');
  let cursor = checkpoint?.lastUpdatedAt ?? null;
  let lastProcessed: Date | null = null;

  try {
    const startTime = Date.now();

    for (;;) {
      if (Date.now() - startTime > maxDuration) {
        warnings.push('Max duration reached, sync paused.');
        break;
      }
      const rows = await fetchProductsSince(cursor, batchSize);
      if (!rows.length) break;

      for (const row of rows) {
        const { product, warnings: rowWarnings } = transformRow(row);
        warnings.push(...rowWarnings);
        try {
          const categories = await ensureCategories(client, product.categories);
          const payload = mapProductToPayload(product, categories);
          const existing = await findProductBySku(client, product.sku);
          if (existing) {
            await requestWithRetry(() => client.put(`/products/${existing.id}`, payload));
          } else {
            await requestWithRetry(() => client.post('/products', payload));
          }
          ok += 1;
        } catch (error: any) {
          failed += 1;
          const message = error?.response?.data?.message || error?.message || 'Unknown error';
          errors.push(`SKU ${product.sku}: ${message}`);
        }
        lastProcessed = new Date(product.updatedAt);
      }

      if (rows.length < batchSize) {
        break;
      }
      cursor = lastProcessed;
    }

    if (lastProcessed) {
      await writeCheckpoint('woo', lastProcessed);
    }

    const finishedAt = new Date();
    await finalizeLog(logId, {
      ok,
      failed,
      notes: {
        warnings,
        errors,
        checkpoint: lastProcessed ? lastProcessed.toISOString() : null,
        triggeredBy: options.triggeredBy || 'manual',
      },
      error: null,
    });

    return {
      target: 'woo',
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      ok,
      failed,
      notes: { warnings, errors },
      checkpoint: lastProcessed ? lastProcessed.toISOString() : null,
    };
  } catch (error) {
    await finalizeLog(logId, {
      ok,
      failed: failed || 1,
      notes: { warnings, errors },
      error: error as Error,
    });
    throw error;
  }
}

export async function getWooStatus(): Promise<SyncSummary | null> {
  const log = await fetchLatestLog('woo');
  return toSummary('woo', log);
}
