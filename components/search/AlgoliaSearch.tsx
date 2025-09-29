import algoliasearch from 'algoliasearch/lite'
import { InstantSearch, SearchBox, Hits, Pagination, Highlight } from 'react-instantsearch-dom'

/*
 * AlgoliaSearch renders a simple search box with results.
 *
 * Props:
 *  - indexName: Name of the Algolia index to query.
 *
 * It uses environment variables NEXT_PUBLIC_ALGOLIA_APP_ID and
 * NEXT_PUBLIC_ALGOLIA_SEARCH_KEY for authentication. Each hit is expected to
 * include a `url` field so that clicking on a result navigates to your
 * product page. Adjust the Hit component if your objects have different
 * attributes (e.g. `name` instead of `title`).
 */
function Hit({ hit }: { hit: any }) {
  const title = hit.title || hit.name || hit.productName || hit.slug || 'Untitled'
  return (
    <a href={hit.url || `/product/${hit.slug || hit.objectID}`}
      className="block p-2 border-b hover:bg-gray-50"
    >
      <div className="font-medium">{title}</div>
      {hit.description && (
        <div className="text-sm text-gray-600 truncate">{hit.description}</div>
      )}
    </a>
  )
}

export default function AlgoliaSearch({ indexName }: { indexName: string }) {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY as string
  const client = algoliasearch(appId, searchKey)
  return (
    <div className="space-y-4">
      <InstantSearch searchClient={client} indexName={indexName}>
        <SearchBox classNames={{ root: 'w-full', input: 'border p-2 w-full' }} />
        <Hits hitComponent={Hit} />
      </InstantSearch>
    </div>
  )
}
