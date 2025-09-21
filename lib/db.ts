// lib/db.ts
import mysql, { Pool, PoolOptions } from 'mysql2/promise';

let _pool: Pool | null = null;

function getConfig(): PoolOptions {
  const {
    TIDB_HOST,
    TIDB_PORT,
    TIDB_USER,
    TIDB_PASSWORD,
    TIDB_DB,
  } = process.env;

  if (!TIDB_HOST || !TIDB_PORT || !TIDB_USER || !TIDB_DB) {
    throw new Error('Missing TiDB env vars. Required: TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_DB');
  }

  return {
    host: TIDB_HOST,
    port: Number(TIDB_PORT),
    user: TIDB_USER,
    password: TIDB_PASSWORD || undefined,
    database: TIDB_DB,
    waitForConnections: true,
    connectionLimit: 5,
    ssl: { minVersion: 'TLSv1.2' },
  };
}

export function pool(): Pool {
  if (!_pool) _pool = mysql.createPool(getConfig());
  return _pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool().execute(sql, params);
  return rows as T[];
}

export type Product = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  price_eur: number | null;
  price: number | null;
  description: string | null;
  category_name: string | null;
  category_slug: string | null;
};
