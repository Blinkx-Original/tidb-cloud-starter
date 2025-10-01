import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../../sync-kit/core/db';

/**
 * Returns the list of columns and their data types for a given table.
 * It reads from INFORMATION_SCHEMA.COLUMNS and orders by ordinal position.
 *
 * Query parameters:
 *  - db: database/schema name (string, required)
 *  - table: table name (string, required)
 *
 * Response: { columns: [{ name: string, type: string }, ...] }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { db, table } = req.query;
  if (!db || !table) {
    res.status(400).json({ error: 'Missing db or table parameter' });
    return;
  }
  try {
    const connection = await getConnection(String(db));
    const [rows] = (await connection.query(
      `SELECT COLUMN_NAME as name, DATA_TYPE as type
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [db, table]
    )) as any;
    await connection.end();
    res.status(200).json({ columns: rows || [] });
  } catch (err: any) {
    console.error('columns endpoint error', err);
    res.status(500).json({ error: err?.message || 'Failed to fetch columns' });
  }
}