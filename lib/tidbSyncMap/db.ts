
import mysql from 'mysql2/promise';
import fs from 'node:fs';

function resolveCa() {
  const candidate = (process.env.TIDB_SSL_CA_PATH || '').trim();
  const paths = [candidate,
    '/etc/ssl/certs/ca-certificates.crt',
    '/etc/pki/tls/certs/ca-bundle.crt',
    '/etc/ssl/cert.pem'
  ].filter(Boolean) as string[];
  for (const p of paths) { try { if (p && fs.existsSync(p)) return fs.readFileSync(p, 'utf8'); } catch {} }
  return undefined;
}

let pool: mysql.Pool | null = null;

export function getDb() {
  if (!pool) {
    const ca = resolveCa();
    const ssl: any = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
    if (ca) ssl.ca = ca;
    pool = mysql.createPool({
      host: process.env.TIDB_HOST,
      port: Number(process.env.TIDB_PORT || 4000),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DB || process.env.TIDB_DATABASE,
      waitForConnections: true,
      connectionLimit: 5,
      ssl,
    });
  }
  return pool!;
}
