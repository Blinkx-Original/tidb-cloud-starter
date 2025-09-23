import algoliasearch, { SearchClient } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;

// NUEVO: si pones el nombre exacto del índice en esta env var, lo usamos tal cual.
const explicitIndex = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

const prefix = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog';
export const getIndexName = (name = 'items') => explicitIndex || `${prefix}__${name}`;

export const searchClient: SearchClient = algoliasearch(appId, searchKey);
