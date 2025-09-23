// components/v2/InlineSearch.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import algoliasearch from 'algoliasearch/lite';

type Hit = {
  objectID: string;
  title?: string;
  brand?: string;
  category?: string;
  price?: number;
  url?: string;
};

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const INDEX_PREFIX =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog';
const INDEX_NAME = `${INDEX_PREFIX}__items`;

export default function InlineSearch({
  className = '',
  inputClassName = '',
  placeholder = 'Buscar productos…',
  maxHits = 5,
}: {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  maxHits?: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const client = useMemo(() => algoliasearch(APP_ID, SEARCH_KEY), []);
  const index = useMemo(() => client.initIndex(INDEX_NAME), [client]);

  // Buscar a medida que escribe (debounce simple)
  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      if (!q.trim()) {
        if (active) setHits([]);
        return;
      }
      try {
        const res = await index.search<Hit>(q, { hitsPerPage: maxHits });
        if (active) setHits(res.hits || []);
      } catch {
        if (active) setHits([]);
      }
    }, 140);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q, index, maxHits]);

  // Cerrar si se hace click fuera
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const submitToSearchPage = (value?: string) => {
    const term = (value ?? q).trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="flex items-center rounded-full bg-base-200 px-4 h-10 w-full">
        <span className="mr-2 opacity-60">🔎</span>
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => q && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitToSearchPage();
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none ${inputClassName}`}
          aria-label="Search"
        />
        <button
          className="ml-3 text-sm btn btn-sm btn-neutral rounded-full"
          onClick={() => submitToSearchPage()}
        >
          Buscar
        </button>
      </div>

      {/* Dropdown */}
      {open && (q || hits.length > 0) && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-base-300 bg-base-100 shadow-lg">
          {hits.length === 0 ? (
            <div className="px-4 py-3 text-sm opacity-70">
              Sin resultados
            </div>
          ) : (
            <ul className="py-1">
              {hits.map((h) => {
                const url =
                  h.url ||
                  (h.title ? `/search?q=${encodeURIComponent(h.title)}` : '#');
                return (
                  <li key={h.objectID}>
                    <a
                      href={url}
                      className="flex items-center justify-between px-4 py-2 hover:bg-base-200"
                      onClick={() => setOpen(false)}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {h.title || 'Sin título'}
                        </div>
                        <div className="text-xs opacity-70 truncate">
                          {h.brand ? `${h.brand} • ` : ''}
                          {h.category || ''}
                        </div>
                      </div>
                      {typeof h.price === 'number' && (
                        <div className="ml-4 whitespace-nowrap text-sm">
                          ${h.price}
                        </div>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="px-4 py-2 border-t border-base-200 text-xs flex items-center justify-between">
            <span>Presiona Enter para buscar</span>
            <span className="opacity-70">{hits.length} resultado(s)</span>
          </div>
        </div>
      )}
    </div>
  );
}
