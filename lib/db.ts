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
    // TiDB Cloud recomienda TLS 1.2+
    ssl: { minVersion: 'TLSv1.2' },
  };
}

function getPool(): Pool {
  if (!_pool) _pool = mysql.createPool(getConfig());
  return _pool;
}

/**
 * PoolFactory: función invocable que devuelve el Pool,
 * pero que además expone métodos .query y .execute
 * para compatibilidad con código legado: pool.query(...)
 */
type PoolFactory = (() => Pool) & {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<any>;
};

// función invocable
const poolFunction = ((): Pool => getPool()) as PoolFactory;

// métodos compatibles
poolFunction.execute = async (sql: string, params: any[] = []) => {
  return getPool().execute(sql, params);
};
poolFunction.query = async <T = any>(sql: string, params: any[] = []) => {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
};

// export: soporta ambos estilos -> pool() y pool.query(...)
export const pool = poolFunction;

// helper tipado recomendado
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return pool.query<T>(sql, params);
}

// Tipo base esperado por las páginas del catálogo
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
