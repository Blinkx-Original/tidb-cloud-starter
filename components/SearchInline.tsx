'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
const INDEX_PREFIX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog';
const INDEX_NAME = `${INDEX_PREFIX}__items`;

export default function SearchInline({
  placeholder = 'Buscar productos…',
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
  const [active, setActive] = useState(-1);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  const [rect, setRect] = useState<{ left: number; top: number; width: number; bottom: number }>({
    left: 0,
    top: 0,
    width: 0,
    bottom: 0,
  });
  const updateRect = () => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ left: r.left, top: r.top + window.scrollY, width: r.width, bottom: r.bottom + window.scrollY });
  };

  const index = useMemo(() => {
    const client = algoliasearch(APP_ID, SEARCH_KEY);
    return client.initIndex(INDEX_NAME);
  }, []);

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
        const res = await index.search(q, { hitsPerPage });
        if (!cancelled) {
          setHits(res.hits as any);
          setOpen(true);
          setActive(-1);
          updateRect();
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

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      const insideInput = !!boxRef.current && boxRef.current.contains(t);
      const insidePortal = !!portalRef.current && portalRef.current.contains(t);
      if (!insideInput && !insidePortal) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const on = () => updateRect();
    window.addEventListener('resize', on);
    window.addEventListener('scroll', on, true);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('scroll', on, true);
    };
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
    <div ref={boxRef} className={['w-full', className].join(' ')}>
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => {
          if (q && hits.length) {
            setOpen(true);
            updateRect();
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        // --- Estilo "pastilla" ---
        className="input input-bordered w-full rounded-full h-12 px-5 text-base"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="algolia-autocomplete-listbox"
        role="combobox"
      />

      {open &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            ref={portalRef}
            className="fixed z-[9999] rounded-xl border border-base-300 bg-base-100 dark:bg-base-200 shadow-xl"
            style={{ left: rect.left, top: rect.bottom + 6, width: rect.width }}
            role="listbox"
            id="algolia-autocomplete-listbox"
            aria-label="Resultados"
          >
            {loading && <div className="px-4 py-3 text-sm opacity-70">Searching…</div>}

            {!loading && hits.length === 0 && (
              <div className="px-4 py-3 text-sm opacity-70">No results</div>
            )}

            {!loading &&
              hits.map((hit, i) => (
                <button
                  key={hit.objectID + i}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goTo(hit)}
                  className={[
                    'flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-base-200',
                    i === active ? 'bg-base-200' : '',
                  ].join(' ')}
                  role="option"
                  aria-selected={i === active}
                >
                  <div className="flex-1">
                    <div className="font-medium">{hit.title || '(untitled)'}</div>
                    <div className="text-xs opacity-70">
                      {(hit.brand ? `${hit.brand} • ` : '') + (hit.category ?? '')}
                    </div>
                  </div>
                  {typeof hit.price === 'number' && (
                    <div className="text-sm tabular-nums">€{hit.price}</div>
                  )}
                </button>
              ))}

            {hits.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 text-xs opacity-70 border-t border-base-300">
                <span>
                  Press <kbd className="kbd kbd-xs">Enter</kbd> to open first result
                </span>
                <span>{hits.length} result(s)</span>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

