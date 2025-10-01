import algoliasearch, { SearchClient } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey =
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ||
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || // por si tenías este nombre
  '';

if (!appId || !searchKey) {
  // Evita romper la app, pero lo dejará claro en consola
  // (puedes cambiar a throw si prefieres crashear).
  // eslint-disable-next-line no-console
  console.warn('Algolia env vars missing: NEXT_PUBLIC_ALGOLIA_APP_ID / NEXT_PUBLIC_ALGOLIA_SEARCH_KEY');
}

export const algoliaSearchClient: SearchClient = algoliasearch(appId, searchKey);

export function resolveIndexName(base: string) {
  const prefix =
    (process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || '').trim();
  return prefix ? `${prefix}${base}` : base;
}

export default algoliaSearchClient;
