import algoliasearch from 'algoliasearch'

// Resolve Algolia App ID: prefer NEXT_PUBLIC_ALGOLIA_APP_ID for client-side usage,
// fall back to ALGOLIA_APP_ID for server-side scripts.
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID
const adminKey = process.env.ALGOLIA_ADMIN_KEY

if (!appId || !adminKey) {
  throw new Error('Missing Algolia env vars. Check NEXT_PUBLIC_ALGOLIA_APP_ID/ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY')
}

export const algoliaClient = algoliasearch(appId, adminKey)
