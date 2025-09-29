
import algoliasearch from 'algoliasearch';
import { getDb } from './db';
import type { ProfileRecord, Mapping } from './types';

function algoliaIndexName(base: string) {
  const prefix = (process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || process.env.ALGOLIA_INDEX_PREFIX || '').trim();
  return prefix ? `${prefix}${base}` : base;
}
function getIndex(base: string) {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const key = process.env.ALGOLIA_ADMIN_KEY!;
  return algoliasearch(appId, key).initIndex(algoliaIndexName(base));
}
function asArray(v:any){ return Array.isArray(v) ? v : (v==null?[]:[v]); }
function parseMaybeArray(x:any){ if(typeof x==='string'){ try{const j=JSON.parse(x);return Array.isArray(j)?j:x;}catch{return x;} } return x; }

function renderUrl(template: string, row: any) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => (row[k] ?? ''));
}

export async function getProfile(key: string): Promise<ProfileRecord | null> {
  const db = getDb();
  const [rows] = await db.query('SELECT * FROM sync_profiles WHERE profile_key=? LIMIT 1', [key]) as any;
  if (!rows.length) return null;
  const p = rows[0];
  const mappings = typeof p.mappings_json === 'string' ? JSON.parse(p.mappings_json) : p.mappings_json;
  return {
    profile_key: p.profile_key,
    name: p.name,
    table_name: p.table_name,
    primary_key: p.primary_key,
    updated_at_col: p.updated_at_col,
    sql_filter: p.sql_filter,
    algolia_index: p.algolia_index,
    object_id_prefix: p.object_id_prefix,
    url_template: p.url_template,
    mappings_json: mappings || []
  };
}

function buildSelect(p: ProfileRecord, extraWhere = '', limit?: number, offset?: number) {
  const cols = Array.from(new Set(p.mappings_json.map(m=>`\`${m.column}\``)));
  if (p.url_template) {
    const needed = Array.from(p.url_template.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)).map(m=>m[1]);
    for (const k of needed) cols.push('`'+k+'`');
  }
  cols.push('`'+p.primary_key+'`');
  const base = `SELECT ${Array.from(new Set(cols)).join(', ')} FROM \`${p.table_name}\``;
  const where = [p.sql_filter?.trim(), extraWhere].filter(Boolean).join(' AND ');
  const whereSql = where ? ` WHERE ${where}` : '';
  const lim = typeof limit==='number' ? ` LIMIT ${limit}` : '';
  const off = typeof offset==='number' ? ` OFFSET ${offset}` : '';
  return `${base}${whereSql}${lim}${off}`;
}

function mapRow(p: ProfileRecord, row: any) {
  const rec: any = {};
  for (const m of p.mappings_json as Mapping[]) {
    if (m.include === false) continue;
    const v = row[m.column];
    rec[m.attr || m.column] = m.jsonArray ? asArray(parseMaybeArray(v)) : v;
  }
  if (p.url_template) {
    rec.url = renderUrl(p.url_template, row);
  }
  const basis = rec.slug || row[p.primary_key];
  rec.objectID = `${p.object_id_prefix || ''}${basis}`;
  if (rec.updated_at == null) rec.updated_at = Math.floor(Date.now()/1000);
  return rec;
}

async function applyIndexSettings(p: ProfileRecord) {
  const index = getIndex(p.algolia_index);
  await index.setSettings({
    searchableAttributes: ['unordered(title)','unordered(description)','unordered(category)','unordered(tags)'],
    attributesForFaceting: ['searchable(category)','searchable(tags)','brand','country','state','city'],
    customRanking: ['desc(rating)','asc(price)'],
    ranking: ['typo','geo','words','filters','proximity','attribute','exact','custom']
  });
}

export async function fullReindexByKey(profileKey: string, chunk = 500, clear = false) {
  const p = await getProfile(profileKey);
  if (!p) throw new Error(`Profile not found: ${profileKey}`);
  const db = getDb();
  const index = getIndex(p.algolia_index);

  if (clear) await index.clearObjects();
  await applyIndexSettings(p);

  const [cnt] = await db.query(`SELECT COUNT(*) AS c FROM \`${p.table_name}\`${p.sql_filter ? ` WHERE ${p.sql_filter}`:''}`) as any;
  const total = Number(cnt[0]?.c || 0);
  let offset = 0, pushed = 0;

  while (offset < total) {
    const sql = buildSelect(p, '', chunk, offset);
    const [rows] = await db.query(sql) as any;
    if (!rows.length) break;
    const objs = rows.map((r:any)=> mapRow(p, r));
    await index.saveObjects(objs, { autoGenerateObjectIDIfNotExist: false });
    pushed += rows.length;
    offset += rows.length;
  }
  return { total, pushed };
}

export async function pushOneByKey(profileKey: string, id: string | number) {
  const p = await getProfile(profileKey);
  if (!p) throw new Error(`Profile not found: ${profileKey}`);
  const db = getDb();
  const index = getIndex(p.algolia_index);
  const sql = `${buildSelect(p, `\`${p.primary_key}\` = ?`)} LIMIT 1`;
  const [rows] = await db.query(sql, [id]) as any;
  if (!rows.length) return { ok:false, reason:'not_found' };
  const obj = mapRow(p, rows[0]);
  await index.saveObject(obj, { autoGenerateObjectIDIfNotExist: false });
  return { ok:true, objectID: obj.objectID, object: obj };
}

export async function columnsForTable(table: string) {
  const db = getDb();
  const [rows] = await db.query(`SHOW COLUMNS FROM \`${table}\``) as any;
  return rows.map((r:any)=> r.Field);
}

export async function previewRow(profileKey: string, id: string | number) {
  const p = await getProfile(profileKey);
  if (!p) throw new Error(`Profile not found: ${profileKey}`);
  const db = getDb();
  const sql = `${buildSelect(p, `\`${p.primary_key}\` = ?`)} LIMIT 1`;
  const [rows] = await db.query(sql, [id]) as any;
  return rows[0] || null;
}
