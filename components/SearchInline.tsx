'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { useRouter } from 'next/router';

type Hit = {
  objectID: string;
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  price?: number;
  url?: string;
};

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const INDEX_PREFIX =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog';
const INDEX_NAME = `${INDEX_PREFIX}__items`;

export default function SearchInline({
  placeholder = 'Search products…',
  hitsPerPage = 5,
  className = '',
}: {
  placeholder?: string;
  hitsPerPage?: number;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState<number>(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => {
    const client = algoliasearch(APP_ID, SEARCH_KEY);
    return client.initIndex(INDEX_NAME);
  }, []);

  // Buscar con un pequeño debounce
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!q.trim()) {
        setHits([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const res = await index.search<Hit>(q, { hitsPerPage });
        if (!cancelled) {
          setHits(res.hits);
          setOpen(true);
          setActive(-1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 160);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, hitsPerPage, index]);

  // Cerrar al click fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function goTo(hit: Hit) {
    const url = hit.url || `/product/${hit.objectID}`;
    router.push(url);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !hits.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = hits[active] ?? hits[0];
      if (target) goTo(target);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q && hits.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="input input-bordered w-full"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="algolia-autocomplete-listbox"
        role="combobox"
      />

      {open && (
        <div
          id="algolia-autocomplete-listbox"
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-xl border border-base-300 bg-base-100 shadow-lg"
        >
          {loading && (
            <div className="px-4 py-3 text-sm opacity-70">Searching…</div>
          )}

          {!loading && hits.length === 0 && (
            <div className="px-4 py-3 text-sm opacity-70">No results</div>
          )}

          {!loading &&
            hits.map((hit, i) => (
              <button
                key={hit.objectID}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goTo(hit)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-base-200 ${
                  i === active ? 'bg-base-200' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="font-medium leading-tight">
                    {hit.title || '(untitled)'}
                  </div>
                  <div className="mt-0.5 text-xs opacity-70 line-clamp-2">
                    {(hit.brand ? `${hit.brand} • ` : '') +
                      (hit.category ?? '')}
                  </div>
                </div>
                {typeof hit.price === 'number' && (
                  <div className="ml-auto whitespace-nowrap text-sm font-semibold">
                    ${hit.price}
                  </div>
                )}
              </button>
            ))}

          {hits.length > 0 && (
            <div className="flex items-center justify-between border-t border-base-300 px-4 py-2 text-xs opacity-70">
              <span>Press Enter to open first result</span>
              <span>{hits.length} result(s)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
