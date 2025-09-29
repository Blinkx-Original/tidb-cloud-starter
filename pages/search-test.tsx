import Head from 'next/head'
import AlgoliaSearch from '@/components/search/AlgoliaSearch'

/**
 * A simple page to test Algolia search integration. This page uses the
 * AlgoliaSearch component to query your configured index. Replace the
 * `indexName` fallback with your own index if necessary.
 */
export default function SearchTest() {
  // Prefer NEXT_PUBLIC_ALGOLIA_INDEX_NAME; fall back to a sensible default
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'catalog__items'
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Head>
        <title>Search Test</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Buscar productos</h1>
      <AlgoliaSearch indexName={indexName} />
    </div>
  )
}