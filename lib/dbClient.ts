// lib/dbClient.ts
import mysql, { Pool } from 'mysql2/promise';

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (_pool) return _pool;
  _pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    port: Number(process.env.TIDB_PORT ?? 4000),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD || undefined,
    database: process.env.TIDB_DB || 'bookshop',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionLimit: 4,
  });
  return _pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}
