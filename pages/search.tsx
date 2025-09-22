// pages/search.tsx
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import CommonLayout from '../components/v2';
import SearchPill from '../components/v2/SearchPill';
import { searchProducts } from '../lib/catalog';
import { formatPriceEUR } from '../lib/price';
import type { Product } from '../lib/db';

type Props = { q: string | null; results: Product[]; error?: boolean };

export default function SearchPage({ q, results, error }: Props) {
  const hasQuery = (q || '').trim().length > 0;

  return (
    <CommonLayout>
      <Head>
        <title>{hasQuery ? `Buscar: ${q} — BlinkX` : 'Buscar — BlinkX'}</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4">
        <section className="py-6 sm:py-8 border-b border-neutral-200">
          <SearchPill size="md" placeholder="Buscar productos..." defaultQuery={q ?? ''} />
          <p className="mt-3 text-sm text-neutral-500">
            {hasQuery ? `Resultados para “${q}”` : 'Escribe para buscar en el catálogo'}
          </p>
        </section>

        {error && (
          <div className="py-6 text-red-600">Hubo un problema con la búsqueda. Intenta de nuevo.</div>
        )}

        {hasQuery && !error && (
          <section className="py-6">
            {results.length === 0 ? (
              <div className="text-neutral-600">No encontramos resultados. Prueba con otro término.</div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((p) => {
                  const price = formatPriceEUR(p.price_eur ?? p.price);
                  return (
                    <li key={p.id} className="border border-neutral-200 rounded-2xl p-4 hover:shadow-sm transition">
                      <Link href={`/product/${p.slug}`} className="block">
                        <div className="aspect-[4/3] w-full bg-neutral-100 rounded-xl mb-3 overflow-hidden">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : null}
                        </div>
                        <h3 className="font-medium">{p.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.description}</p>
                        <div className="mt-2 text-sm text-neutral-500">{p.category_name ?? 'Sin categoría'}</div>
                        {price && <div className="mt-2 font-semibold">{price}</div>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </main>
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const q = (ctx.query.q as string | undefined)?.trim() ?? null;
  if (!q) return { props: { q: null, results: [] } };

  try {
    const results = await searchProducts(q, 30);
    return { props: { q, results } };
  } catch (e) {
    console.error('SSR /search error:', e);
    return { props: { q, results: [], error: true } };
  }
};
