// lib/algoliaAdmin.ts
import algoliasearch from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const adminKey = process.env.ALGOLIA_ADMIN_KEY!;
export const indexPrefix =
  process.env.ALGOLIA_INDEX_PREFIX || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog';

export const adminClient = algoliasearch(appId, adminKey);
export const itemsIndexName = `${indexPrefix}__items`;
export const itemsIndex = adminClient.initIndex(itemsIndexName);
export const itemsIndexAsc = adminClient.initIndex(`${itemsIndexName}_price_asc`);
export const itemsIndexDesc = adminClient.initIndex(`${itemsIndexName}_price_desc`);
