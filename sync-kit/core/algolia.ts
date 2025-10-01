// REEMPLAZA el contenido por esto o añade la helper resolveIndexName
import algoliasearch from 'algoliasearch';

export function resolveIndexName(base: string) {
  const prefix =
    (process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX ||
      process.env.ALGOLIA_INDEX_PREFIX ||
      '').trim();
  return prefix ? `${prefix}${base}` : base;
}

export function getIndex(indexName: string) {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const adminKey =
    process.env.ALGOLIA_ADMIN_KEY ||
    process.env.ALGOLIA_WRITE_KEY ||
    process.env.ALGOLIA_API_KEY ||
    '';
  if (!appId || !adminKey) {
    throw new Error(
      'Algolia credentials missing: set NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY'
    );
  }
  return algoliasearch(appId, adminKey).initIndex(indexName);
}
