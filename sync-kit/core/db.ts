import mysql from 'mysql2/promise';
import fs from 'fs';

/**
 * Resolves the CA certificate to use for TLS connections. TiDB Cloud
 * clusters require TLS; this function searches common locations and
 * honours the TIDB_SSL_CA_PATH environment variable.
 */
function resolveCa(): string | undefined {
  const candidate = (process.env.TIDB_SSL_CA_PATH || '').trim();
  const paths = [
    candidate,
    '/etc/ssl/certs/ca-certificates.crt',
    '/etc/pki/tls/certs/ca-bundle.crt',
    '/etc/ssl/cert.pem',
  ].filter(Boolean) as string[];
  for (const p of paths) {
    try {
      if (p && fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    } catch {
      // ignore
    }
  }
  return undefined;
}

/**
 * Creates a one‑off MySQL connection to the given database using the
 * environment variables for host, port, user and password.
 * By default it falls back to TIDB_DB or TIDB_DATABASE if dbName is not provided.
 */
export async function getConnection(dbName: string) {
  const ca = resolveCa();
  const ssl: any = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
  if (ca) {
    ssl.ca = ca;
  }
  const connection = await mysql.createConnection({
    host: process.env.TIDB_HOST,
    port: Number(process.env.TIDB_PORT || 4000),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: dbName || process.env.TIDB_DB || process.env.TIDB_DATABASE,
    ssl,
  });
  return connection;
}