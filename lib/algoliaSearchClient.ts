import algoliasearch, { SearchClient } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey =
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ||
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || // fallback por compatibilidad
  '';

if (!appId || !searchKey) {
  // No romper en producción, pero avisa en consola.
  // eslint-disable-next-line no-console
  console.warn(
    'Algolia env vars missing: NEXT_PUBLIC_ALGOLIA_APP_ID / NEXT_PUBLIC_ALGOLIA_SEARCH_KEY'
  );
}

// Cliente de búsqueda
export const searchClient: SearchClient = algoliasearch(appId, searchKey);

// Función para resolver el nombre de índice con prefijo opcional
export function resolveIndexName(base: string) {
  const rawPrefix = (process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || '').trim();
  if (!rawPrefix) return base;

  // Aseguramos que termine en "_" para que no quede pegado
  const prefix = rawPrefix.endsWith('_') ? rawPrefix : `${rawPrefix}_`;
  return `${prefix}${base}`;
}

export default searchClient;
