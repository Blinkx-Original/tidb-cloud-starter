import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.TIDB_HOST!,
  port: Number(process.env.TIDB_PORT || 4000),
  user: process.env.TIDB_USER!,
  password: process.env.TIDB_PASSWORD!,
  database: process.env.TIDB_DB || 'bookshop',
  ssl: { rejectUnauthorized: true },
  connectionLimit: 10,
});
