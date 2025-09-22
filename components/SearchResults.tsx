'use client';

import {
  InstantSearch,
  SearchBox,
  RefinementList,
  SortBy,
  Pagination,
  InfiniteHits,
  Configure,
  Stats
} from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';
import HitCard from '@/components/HitCard';
import { searchClient, getIndexName } from '@/lib/algoliaSearchClient';

export default function SearchResults({ initialQuery = '' }: { initialQuery?: string }) {
  const indexName = getIndexName('items');

  return (
    <InstantSearch
      indexName={indexName}
      searchClient={searchClient}
      routing={{
        router: history(),
        stateMapping: {
          stateToRoute(uiState: any) {
            const indexUi = uiState[indexName] || {};
            return {
              q: indexUi.query,
              page: indexUi.page,
              categories: indexUi.refinementList?.category
            };
          },
          routeToState(routeState: any) {
            return {
              [indexName]: {
                query: routeState.q || '',
                page: routeState.page,
                refinementList: { category: routeState.categories }
              }
            };
          }
        }
      }}
      insights={true}
    >
      <Configure
        hitsPerPage={24}
        removeStopWords={true}
        typoTolerance="min"
        analytics={true}
        clickAnalytics={true}
        query={initialQuery}
      />

      <div className="grid">
        <aside className="facets">
          <Stats />
          <SearchBox placeholder="Search catalog…" submitIconComponent={null} resetIconComponent={null} />
          <div className="facet">
            <h4>Category</h4>
            <RefinementList attribute="category" searchable={true} searchablePlaceholder="Filter categories…" />
          </div>
          <div className="facet">
            <h4>Tags</h4>
            <RefinementList attribute="tags" searchable={true} />
          </div>
          <div className="facet">
            <h4>Brand</h4>
            <RefinementList attribute="brand" searchable={true} />
          </div>
        </aside>

        <main className="results">
          <div className="toolbar">
            <SortBy
              items={[
                { value: indexName, label: 'Relevance' },
                { value: `${indexName}_price_asc`, label: 'Price ↑' },
                { value: `${indexName}_price_desc`, label: 'Price ↓' }
              ]}
            />
          </div>

          <InfiniteHits hitComponent={HitCard as any} showPrevious={false} />
          <Pagination />
        </main>
      </div>

      <style jsx>{`
        .grid { display: grid; grid-template-columns: 260px 1fr; gap: 24px; }
        .facets { position: sticky; top: 76px; align-self: start; display: flex; flex-direction: column; gap: 16px; }
        .facet h4 { margin: 8px 0; }
        .results .toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
        @media (max-width: 1024px) { .grid { grid-template-columns: 1fr; } .facets { position: static; } }
      `}</style>
    </InstantSearch>
  );
}
