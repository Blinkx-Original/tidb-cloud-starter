// components/v2/InlineSearch.tsx
import * as React from 'react';
import algoliasearch from 'algoliasearch/lite';
import Link from 'next/link';
import { useRouter } from 'next/router';

type Props = {
  placeholder?: string;
  className?: string;
  hitsPerPage?: number;
};

type Hit = {
  objectID: string;
  title?: string;
  description?: string;
  url?: string;
  category?: string;
  brand?: string;
  price?: number;
  // añade aquí los campos que uses en Algolia
};

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const prefix =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog';
const indexName = `${prefix}__items`;

const searchClient = algoliasearch(appId, searchKey);
const index = searchClient.initIndex(indexName);

export default function InlineSearch({
  placeholder = 'Buscar…',
  className = '',
  hitsPerPage = 5,
}: Props) {
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [active, setActive] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Cierra al hacer click fuera
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActive(0);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Búsqueda con debounce (250ms)
  React.useEffect(() => {
    if (!q) {
      setHits([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await index.search<Hit>(q, {
          hitsPerPage,
        });
        if (!cancelled) {
          setHits(res.hits || []);
          setOpen(true);
          setActive(0);
        }
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, hitsPerPage]);

  // Teclado: ↑ ↓ Enter Esc
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hits[active]) {
        goTo(hits[active]);
      } else {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function goTo(hit: Hit) {
    const href = hit.url || `/search?q=${encodeURIComponent(q)}`;
    router.push(href);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-full border border-base-300 px-3 h-10 bg-base-100">
        <span className="i bi-search opacity-60" aria-hidden />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none"
          aria-label="Buscar productos"
        />
        {q && (
          <button
            onClick={() => {
              setQ('');
              setHits([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="text-xs opacity-60 hover:opacity-100"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-base-300 bg-base-100 shadow-xl overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm opacity-70">Buscando…</div>
          )}

          {!loading && hits.length === 0 && (
            <div className="px-4 py-3 text-sm opacity-70">
              Sin resultados. Pulsa Enter para abrir búsqueda completa.
            </div>
          )}

          <ul role="listbox" aria-label="Sugerencias">
            {hits.map((hit, i) => (
              <li
                key={hit.objectID}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // evita blur
                onClick={() => goTo(hit)}
                className={`cursor-pointer px-4 py-3 border-b last:border-none border-base-200 ${
                  i === active ? 'bg-base-200/60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {hit.title || 'Sin título'}
                    </div>
                    <div className="text-xs opacity-70 truncate">
                      {hit.brand} {hit.brand && '•'} {hit.category}
                    </div>
                  </div>
                  {typeof hit.price === 'number' && (
                    <div className="text-sm font-semibold whitespace-nowrap">
                      €{hit.price.toFixed(2)}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 py-2 text-xs opacity-70 flex items-center justify-between">
            <span>Pulsa Enter para abrir el primer resultado</span>
            <Link
              href={`/search?q=${encodeURIComponent(q)}`}
              className="underline"
              onClick={() => setOpen(false)}
            >
              Ver todos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
