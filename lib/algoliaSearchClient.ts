import algoliasearch, { SearchClient } from 'algoliasearch';

function normalize(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

const appId = normalize(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID);
const searchKey =
  normalize(process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) ||
  normalize(process.env.NEXT_PUBLIC_ALGOLIA_API_KEY);

let cachedClient: SearchClient | null | undefined;
let warnedMissingCredentials = false;

export function isAlgoliaConfigured(): boolean {
  return Boolean(appId && searchKey);
}

export function getSearchClient(): SearchClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!appId || !searchKey) {
    if (!warnedMissingCredentials) {
      warnedMissingCredentials = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[algolia] Search disabled: NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY are not fully configured.',
      );
    }
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = algoliasearch(appId, searchKey);
  return cachedClient;
}

// Función para resolver el nombre de índice con prefijo opcional
export function resolveIndexName(base: string) {
  const rawPrefix = normalize(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX);
  if (!rawPrefix) return base;

  // Aseguramos que termine en "_" para que no quede pegado
  const prefix = rawPrefix.endsWith('_') ? rawPrefix : `${rawPrefix}_`;
  return `${prefix}${base}`;
}

export default getSearchClient;
