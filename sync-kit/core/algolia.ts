import algoliasearch from 'algoliasearch';

/**
 * Returns an Algolia index instance for the given index name.
 * It expects NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY (or ALGOLIA_WRITE_KEY) to be set.
 */
export function getIndex(indexName: string) {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const adminKey =
    process.env.ALGOLIA_ADMIN_KEY ||
    process.env.ALGOLIA_WRITE_KEY ||
    process.env.ALGOLIA_API_KEY ||
    '';
  if (!appId || !adminKey) {
    throw new Error(
      'Algolia credentials are not defined. Please set NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY env vars.'
    );
  }
  return algoliasearch(appId, adminKey).initIndex(indexName);
}