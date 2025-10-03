import fs from "fs";
import mysql, { Pool, PoolConnection } from "mysql2/promise";
import { SyncCheckpoint, SyncTarget, TiDBProductRow } from "./types";

let pool: Pool | null = null;
let schemaPromise: Promise<void> | null = null;

function getEnv(name: string) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value.trim();
}

function resolveCa(): string | undefined {
  const candidate = (process.env.TIDB_SSL_CA_PATH || "").trim();
  const paths = [
    candidate,
    "/etc/ssl/certs/ca-certificates.crt",
    "/etc/pki/tls/certs/ca-bundle.crt",
    "/etc/ssl/cert.pem",
  ].filter(Boolean) as string[];
  for (const path of paths) {
    try {
      if (path && fs.existsSync(path)) {
        return fs.readFileSync(path, "utf8");
      }
    } catch {
      // ignore
    }
  }
  return undefined;
}

function buildPool(): Pool {
  if (pool) return pool;
  const host = getEnv("TIDB_HOST");
  const port = Number(getEnv("TIDB_PORT"));
  const user = getEnv("TIDB_USER");
  const database = process.env.TIDB_DATABASE || process.env.TIDB_DB;
  if (!database) {
    throw new Error(
      "Missing TiDB database name. Provide TIDB_DATABASE or TIDB_DB",
    );
  }
  const password = process.env.TIDB_PASSWORD || undefined;
  const ca = resolveCa();

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
    ssl: ca
      ? {
          ca,
          minVersion: "TLSv1.2",
          rejectUnauthorized: true,
        }
      : { minVersion: "TLSv1.2", rejectUnauthorized: true },
  });
  return pool;
}

export function getPool(): Pool {
  return buildPool();
}

async function ensureSchema(): Promise<void> {
  if (schemaPromise) {
    return schemaPromise;
  }
  schemaPromise = (async () => {
    const conn = await getPool().getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS sync_checkpoint (
          target VARCHAR(32) PRIMARY KEY,
          last_updated_at DATETIME NOT NULL
        )
      `);
      await conn.query(`
        CREATE TABLE IF NOT EXISTS sync_log (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          target VARCHAR(32) NOT NULL,
          started_at DATETIME NOT NULL,
          finished_at DATETIME NULL,
          ok_count INT DEFAULT 0,
          fail_count INT DEFAULT 0,
          notes TEXT NULL
        )
      `);
    } finally {
      conn.release();
    }
  })().catch((error) => {
    schemaPromise = null;
    throw error;
  });
  return schemaPromise;
}

export async function ensureSyncTables(): Promise<void> {
  await ensureSchema();
}

export async function withConnection<T>(
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
}

export async function fetchProductsSince(
  since: Date | null,
  limit: number,
): Promise<TiDBProductRow[]> {
  await ensureSchema();
  const sql = `
    SELECT
      id, sku, slug, name, brand, short_description, long_description,
      price, currency, categories, attributes, images,
      is_published, stock_qty, stock_status, canonical_sku,
      created_at, updated_at
    FROM products
    ${since ? "WHERE updated_at > ?" : ""}
    ORDER BY updated_at ASC
    LIMIT ?
  `;
  const params: any[] = [];
  if (since) params.push(since);
  params.push(limit);
  const [rows] = await getPool().query(sql, params);
  return rows as TiDBProductRow[];
}

export async function fetchProductBySlug(
  slug: string,
): Promise<TiDBProductRow | null> {
  await ensureSchema();
  const sql = `
    SELECT
      id, sku, slug, name, brand, short_description, long_description,
      price, currency, categories, attributes, images,
      is_published, stock_qty, stock_status, canonical_sku,
      created_at, updated_at
    FROM products
    WHERE slug = ?
    LIMIT 1
  `;
  const [rows] = await getPool().query(sql, [slug]);
  const arr = rows as TiDBProductRow[];
  return arr[0] || null;
}

export async function readCheckpoint(
  target: SyncTarget,
): Promise<SyncCheckpoint | null> {
  await ensureSchema();
  const [rows] = await getPool().query(
    "SELECT target, last_updated_at FROM sync_checkpoint WHERE target = ? LIMIT 1",
    [target],
  );
  const arr = rows as { target: SyncTarget; last_updated_at: Date }[];
  if (!arr.length) return null;
  return {
    target: arr[0].target,
    lastUpdatedAt: new Date(arr[0].last_updated_at),
  };
}

export async function writeCheckpoint(
  target: SyncTarget,
  lastUpdatedAt: Date,
): Promise<void> {
  await ensureSchema();
  await getPool().execute(
    `INSERT INTO sync_checkpoint (target, last_updated_at)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE last_updated_at = VALUES(last_updated_at)`,
    [target, lastUpdatedAt],
  );
}

export async function fetchRecentCheckpoints(): Promise<SyncCheckpoint[]> {
  await ensureSchema();
  const [rows] = await getPool().query(
    "SELECT target, last_updated_at FROM sync_checkpoint ORDER BY target ASC",
  );
  return (rows as { target: SyncTarget; last_updated_at: Date }[]).map(
    (row) => ({
      target: row.target,
      lastUpdatedAt: new Date(row.last_updated_at),
    }),
  );
}

export async function fetchProductsMissingSlug(
  limit = 500,
): Promise<TiDBProductRow[]> {
  await ensureSchema();
  const sql = `
    SELECT
      id, sku, slug, name, brand, short_description, long_description,
      price, currency, categories, attributes, images,
      is_published, stock_qty, stock_status, canonical_sku,
      created_at, updated_at
    FROM products
    WHERE (slug IS NULL OR slug = '')
    ORDER BY updated_at DESC
    LIMIT ?
  `;
  const [rows] = await getPool().query(sql, [limit]);
  return rows as TiDBProductRow[];
}

export async function updateProductSlug(
  id: number,
  slug: string,
): Promise<void> {
  await ensureSchema();
  await getPool().execute("UPDATE products SET slug = ? WHERE id = ?", [
    slug,
    id,
  ]);
}
