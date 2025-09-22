// Server/Node only helpers. Do not import this in client components.
import algoliasearch from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const adminKey = process.env.ALGOLIA_ADMIN_KEY!;
const prefix = process.env.ALGOLIA_INDEX_PREFIX || 'catalog';

export const getAdminIndexName = (name = 'items') => `${prefix}__${name}`;
export const adminClient = () => algoliasearch(appId, adminKey);
