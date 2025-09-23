/* eslint-disable react/no-unknown-property */
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
} from 'react-instantsearch-dom';
import { history } from 'instantsearch.js/es/lib/routers';
import HitCard from '@/components/HitCard';
import { searchClient, getIndexName } from '@/lib/algoliaSearchClient';

export default function SearchResults({ initialQuery = '' }: { initialQuery?: string }) {
  const indexName = getIndexName('items'); // busca en "<PREFIX>__items" (p.ej. catalog__items)

  return (
    <InstantSearch
      indexName={indexName}
      searchClient={searchClient}
      routing={{
        router: history(),
        stateMapping: {
          stateToRoute(uiState: any) {
            const s = uiState[indexName] || {};
            return {
              q: s.query,
              page: s.page,
              categories: s.refinementList?.category
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
      insights
    >
      {/* === CAMBIO #2: comportamiento de búsqueda tipo “fuzzy” y prefijos === */}
      <Configure
        hitsPerPage={24}
        queryType="prefixAll"
        removeStopWords
        ignorePlurals
        typoTolerance="min"
        analytics
        clickAnalytics
        query={initialQuery}
      />

      <div className="grid">
        <aside className="facets">
          <Stats />
          <SearchBox placeholder="Search catalog…" />
          <div className="facet">
            <h4>Category</h4>
            <RefinementList attribute="category" searchable searchablePlaceholder="Filter categories…" />
          </div>
          <div className="facet">
            <h4>Tags</h4>
            <RefinementList attribute="tags" searchable />
          </div>
          <div className="facet">
            <h4>Brand</h4>
            <RefinementList attribute="brand" searchable />
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

        /* === CAMBIO #3: quitar bullets feos de la paginación === */
        :global(.ais-Pagination-list){ list-style: none; display: flex; gap: 8px; padding: 0; margin: 8px 0; }
        :global(.ais-Pagination-item){ list-style: none; }
        :global(.ais-Pagination-link){ text-decoration: none; }

        @media (max-width: 1024px) {
          .grid { grid-template-columns: 1fr; }
          .facets { position: static; }
        }
      `}</style>
    </InstantSearch>
  );
}
