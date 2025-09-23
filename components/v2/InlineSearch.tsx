'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  useSearchBox,
  useHits,
  Highlight,
  Configure,
} from 'react-instantsearch-dom';

type InlineSearchProps = {
  placeholder?: string;
  minChars?: number;
  maxSuggestions?: number;
  className?: string;
};

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const indexName =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ||
  `${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog'}__items`;

const searchClient = algoliasearch(appId, apiKey);

export default function InlineSearch({
  placeholder = 'Search…',
  minChars = 2,
  maxSuggestions = 6,
  className = '',
}: InlineSearchProps) {
  // Envolver toda la UI en InstantSearch
  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      <Configure hitsPerPage={maxSuggestions} />
      <InlineSearchInner
        placeholder={placeholder}
        minChars={minChars}
        maxSuggestions={maxSuggestions}
        className={className}
      />
    </InstantSearch>
  );
}

function InlineSearchInner({
  placeholder,
  minChars,
  maxSuggestions,
  className,
}: InlineSearchProps) {
  const router = useRouter();
  const { query, refine } = useSearchBox();
  const { hits } = useHits<any>();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // abrir/cerrar panel segun query
  useEffect(() => {
    setOpen((query || '').trim().length >= minChars);
  }, [query, minChars]);

  // cerrar al click fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const visibleHits = useMemo(() => hits.slice(0, maxSuggestions), [hits, maxSuggestions]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const q = (query || '').trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => refine(e.target.value)}
          placeholder={placeholder}
          className="input input-bordered w-72 md:w-[28rem]"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
      </form>

      {open && visibleHits.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-base-300 bg-base-100 shadow-xl">
          <ul className="menu p-2">
            {visibleHits.map((hit: any) => (
              <li key={hit.objectID}>
                <button
                  className="justify-start text-left"
                  onClick={() => {
                    setOpen(false);
                    // Cambia esta navegación si tu ruta de producto es distinta
                    const slug = hit.slug || hit.objectID;
                    if (slug) router.push(`/product/${slug}`);
                    else router.push(`/search?q=${encodeURIComponent(hit.name || query)}`);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      <Highlight attribute="name" hit={hit} />
                    </span>
                    {hit.category_name && (
                      <span className="text-xs opacity-70">{hit.category_name}</span>
                    )}
                    {hit.description && (
                      <span className="text-xs line-clamp-1 opacity-70">
                        <Highlight attribute="description" hit={hit} />
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-base-200 p-2 text-right">
            <button
              className="link link-primary text-sm"
              onClick={() => {
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(query || '')}`);
              }}
            >
              Ver más resultados →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
