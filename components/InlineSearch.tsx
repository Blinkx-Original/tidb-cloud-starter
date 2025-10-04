'use client';

import algoliasearch from 'algoliasearch/lite';
import Link from 'next/link';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
  RefinementList,
  Stats,
} from 'react-instantsearch-dom';
import React from 'react';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
const indexName =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PRIMARY || process.env.NEXT_PUBLIC_ALGOLIA_INDEX || process.env.ALGOLIA_INDEX_PRIMARY;

if (!appId || !searchKey || !indexName) {
  console.warn('Algolia environment variables are missing for InlineSearch');
}

const searchClient = appId && searchKey ? algoliasearch(appId, searchKey) : undefined;

type HitType = {
  objectID: string;
  name: string;
  url: string;
  brand?: string;
  price?: number;
  currency?: string;
  images?: string[];
  categories?: string[];
  stockStatus?: string;
};

function Hit({ hit }: { hit: HitType }) {
  const image = hit.images?.[0];
  return (
    <Link
      href={hit.url || '#'}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={hit.name} className="h-16 w-16 rounded object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
          Sin imagen
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{hit.name}</p>
        <p className="text-xs text-gray-500">
          {hit.brand}
          {hit.brand && hit.categories?.length ? ' • ' : ''}
          {hit.categories?.join(', ')}
        </p>
        <p className="text-xs text-gray-500">Disponibilidad: {hit.stockStatus || '—'}</p>
      </div>
      {typeof hit.price === 'number' && (
        <span className="text-sm font-semibold text-gray-900">
          {hit.currency || 'USD'} {hit.price.toFixed(2)}
        </span>
      )}
    </Link>
  );
}

export type InlineSearchProps = {
  placeholder?: string;
  hitsPerPage?: number;
};

export default function InlineSearch({ placeholder = 'Buscar productos…', hitsPerPage = 8 }: InlineSearchProps) {
  if (!searchClient || !indexName) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
        La búsqueda no está configurada correctamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InstantSearch indexName={indexName} searchClient={searchClient}>
        <Configure filters="isPublished:true" hitsPerPage={hitsPerPage} />
        <SearchBox translations={{ placeholder }} submitIconComponent={() => null} resetIconComponent={() => null} />
        <Stats translations={{ stats: (nbHits) => `${nbHits} resultados` }} />
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-6 md:col-span-1">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Marca</h3>
              <RefinementList attribute="brand" searchable />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Categorías</h3>
              <RefinementList attribute="categories" searchable />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</h3>
              <RefinementList attribute="stockStatus" />
            </div>
          </div>
          <div className="md:col-span-3 space-y-4">
            <Hits hitComponent={Hit as any} />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
}
