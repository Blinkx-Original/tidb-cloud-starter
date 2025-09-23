// components/v2/InlineSearch.tsx
import React from 'react';
import Link from 'next/link';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  useInstantSearch,
  useSearchBox,
  Highlight,
} from 'react-instantsearch-hooks-web';

type InlineSearchProps = {
  placeholder?: string;
  className?: string;
  maxHits?: number;
};

/** Pequeño helper para evitar SSR-mismatch: sólo renderiza en cliente */
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

function EmptyIndicator() {
  const { results } = useInstantSearch();
  const { query } = useSearchBox();

  if (!results || !query) return null;
  if (results.nbHits > 0) return null;
  return (
    <div className="px-3 py-2 text-sm opacity-70">Sin resultados para “{query}”.</div>
  );
}

type Hit = {
  objectID: string;
  title?: string;
  name?: string;
  price?: number | string;
  price_eur?: number;
  category?: string;
  brand?: string;
  url?: string;
  slug?: string;
};

function HitRow({ hit }: { hit: Hit }) {
  const title = hit.title || hit.name || 'Sin título';
  const price =
    typeof hit.price_eur === 'number'
      ? `€${hit.price_eur.toFixed(2)}`
      : typeof hit.price === 'number'
      ? `$${hit.price.toFixed(2)}`
      : typeof hit.price === 'string'
      ? hit.price
      : undefined;

  const href = hit.url || (hit.slug ? `/product/${hit.slug}` : '#');

  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-base-200 transition"
    >
      <div className="min-w-0">
        <div className="font-medium truncate">
          <Highlight attribute="title" hit={hit as any} />
        </div>
        <div className="text-xs opacity-70 truncate">
          {hit.brand ? `${hit.brand} • ` : ''}
          {hit.category || '–'}
        </div>
      </div>
      {price ? <div className="ml-3 text-sm font-semibold shrink-0">{price}</div> : null}
    </Link>
  );
}

export default function InlineSearch({
  placeholder = 'Buscar…',
  className = '',
  maxHits = 5,
}: InlineSearchProps) {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
  const prefix =
    process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX || 'catalog';
  const indexName = `${prefix}__items`;

  // Cliente de búsqueda (sólo en cliente; el ClientOnly evita SSR)
  const searchClient = React.useMemo(
    () => algoliasearch(appId, searchKey),
    [appId, searchKey]
  );

  // controlamos abrir/cerrar el panel
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <ClientOnly>
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <div className={`relative w-full ${className}`} ref={panelRef}>
          <SearchBox
            placeholder={placeholder}
            classNames={{
              root: 'w-full',
              input:
                'w-full h-10 pl-9 pr-3 rounded-full border border-base-300 bg-base-100 focus:outline-none',
              submitIcon: 'hidden',
              resetIcon: 'hidden',
              loadingIcon: 'hidden',
            }}
            onFocus={() => setOpen(true)}
            queryHook={(q, setQuery) => {
              setOpen(true);
              setQuery(q);
            }}
          />

          {/* Panel de resultados */}
          {open && (
            <div
              className="absolute left-0 right-0 mt-2 rounded-2xl border border-base-300 bg-base-100 shadow-xl z-50"
              role="listbox"
            >
              <div className="max-h-80 overflow-auto py-2">
                <Hits
                  hitComponent={HitRow as any}
                  classNames={{
                    list: 'flex flex-col gap-1',
                    item: 'px-2',
                  }}
                  transformItems={(items) => items.slice(0, maxHits)}
                />
                <EmptyIndicator />
              </div>
              <div className="px-3 py-2 text-xs opacity-70 border-t border-base-200">
                Pulsa <kbd className="px-1 rounded border">Enter</kbd> para abrir el primer
                resultado
              </div>
            </div>
          )}
        </div>
      </InstantSearch>
    </ClientOnly>
  );
}
