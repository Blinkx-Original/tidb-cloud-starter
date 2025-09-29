
import algoliasearch from 'algoliasearch';
import { getDb } from './db';
import { profiles } from './profiles';
import type { Profile } from './types';

function algoliaIndexName(base: string) {
  const prefix = (process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || process.env.ALGOLIA_INDEX_PREFIX || '').trim();
  return prefix ? `${prefix}${base}` : base;
}

function getIndex(base: string) {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const key = process.env.ALGOLIA_ADMIN_KEY!;
  return algoliasearch(appId, key).initIndex(algoliaIndexName(base));
}

function safeParseArray(s: string) { try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; } }

function mapRow(p: Profile, row: any) {
  const rec: any = {};
  for (const f of p.fields) {
    if (f.include === false) continue;
    const v = row[f.column];
    rec[f.attr || f.column] = f.jsonArray && typeof v === 'string' ? safeParseArray(v) : v;
  }
  Object.assign(rec, p.transform ? p.transform(row) : {});
  const basis = rec.slug || row[p.primaryKey];
  rec.objectID = `${p.objectIdPrefix || ''}${basis}`;
  if (rec.updated_at == null) rec.updated_at = Math.floor(Date.now() / 1000);
  return rec;
}

async function setSettings(baseIndex: string) {
  const index = getIndex(baseIndex);
  await index.setSettings({
    searchableAttributes: [
      'unordered(title)', 'unordered(description)', 'unordered(category)', 'unordered(tags)'
    ],
    attributesForFaceting: ['searchable(category)', 'searchable(tags)', 'brand', 'country', 'state', 'city'],
    customRanking: ['desc(rating)', 'asc(price)'],
    ranking: ['typo','geo','words','filters','proximity','attribute','exact','custom'],
    typoTolerance: 'min',
    removeStopWords: true,
    ignorePlurals: true,
    minWordSizefor1Typo: 4,
    minWordSizefor2Typos: 8,
  });
  const base = algoliaIndexName(baseIndex);
  await index.setSettings({ replicas: [`${base}_price_asc`, `${base}_price_desc`] });
  await getIndex(`${baseIndex}_price_asc`).setSettings({ ranking: ['asc(price)','typo','geo','words','filters','proximity','attribute','exact','custom'] });
  await getIndex(`${baseIndex}_price_desc`).setSettings({ ranking: ['desc(price)','typo','geo','words','filters','proximity','attribute','exact','custom'] });
}

function buildSelect(p: Profile, whereExtra = '', limit?: number, offset?: number) {
  const cols = Array.from(new Set(p.fields.map(f => `\`${f.column}\``))).join(', ');
  const base = `SELECT ${cols} FROM \`${p.table}\``;
  const whereParts = [p.sqlFilter?.trim(), whereExtra].filter(Boolean);
  const whereSql = whereParts.length ? ` WHERE ${whereParts.join(' AND ')}` : '';
  const lim = typeof limit === 'number' ? ` LIMIT ${limit}` : '';
  const off = typeof offset === 'number' ? ` OFFSET ${offset}` : '';
  return `${base}${whereSql}${lim}${off}`;
}

export async function fullReindex(profileKey: string, chunk = 500, clearFirst = false) {
  const p = profiles[profileKey]; if (!p) throw new Error(`Unknown profile: ${profileKey}`);
  const db = getDb();
  const index = getIndex(p.algoliaIndex);

  if (clearFirst) await index.clearObjects();
  await setSettings(p.algoliaIndex);

  const [cnt] = await db.query(`SELECT COUNT(*) AS c FROM \`${p.table}\`${p.sqlFilter ? ` WHERE ${p.sqlFilter}` : ''}`) as any;
  const total = Number(cnt[0]?.c || 0);
  let offset = 0, pushed = 0;

  while (offset < total) {
    const sql = buildSelect(p, '', chunk, offset);
    const [rows] = await db.query(sql) as any;
    if (!rows.length) break;
    await index.saveObjects(rows.map((r:any) => mapRow(p, r)), { autoGenerateObjectIDIfNotExist: false });
    pushed += rows.length;
    offset += rows.length;
  }
  return { total, pushed };
}

export async function pushOne(profileKey: string, id: string | number) {
  const p = profiles[profileKey]; if (!p) throw new Error(`Unknown profile: ${profileKey}`);
  const db = getDb();
  const index = getIndex(p.algoliaIndex);
  const sql = `${buildSelect(p, `\`${p.primaryKey}\` = ?`)} LIMIT 1`;
  const [rows] = await db.query(sql, [id]) as any;
  if (!rows.length) return { ok: false, reason: 'not_found' };
  const obj = mapRow(p, rows[0]);
  await index.saveObject(obj, { autoGenerateObjectIDIfNotExist: false });
  return { ok: true, objectID: obj.objectID, object: obj };
}

export async function preview(profileKey: string, id: string | number) {
  const p = profiles[profileKey]; if (!p) throw new Error(`Unknown profile: ${profileKey}`);
  const db = getDb();
  const sql = `${buildSelect(p, `\`${p.primaryKey}\` = ?`)} LIMIT 1`;
  const [rows] = await db.query(sql, [id]) as any;
  return rows[0] || null;
}
