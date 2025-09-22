import algoliasearch, { SearchClient } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const prefix = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog';

export const getIndexName = (name = 'items') => `${prefix}__${name}`;
export const searchClient: SearchClient = algoliasearch(appId, searchKey);
