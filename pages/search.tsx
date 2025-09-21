// pages/search.tsx
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import CommonLayout from '@/components/v2';
import SearchPill from '@/components/v2/SearchPill';
import { Product, query } from '@/lib/db';
import Link from 'next/link';

type Props = {
  q: string | null;
  results: Product[];
};

export default function SearchPage({ q, results }: Props) {
  const hasQuery = (q || '').trim().length > 0;

  return (
    <CommonLayout>
      <Head>
        <title>{hasQuery ? `Buscar: ${q} — BlinkX` : 'Buscar — BlinkX'}</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4">
        <section className="py-6 sm:py-8 border-b border-neutral-200">
          <SearchPill size="md" placeholder="Buscar productos…" defaultQuery={q ?? ''} />
          <p className="mt-3 text-sm text-neutral-500">
            {hasQuery ? `Resultados para “${q}”` : 'Escribe para buscar en el catálogo'}
          </p>
        </section>

        {hasQuery && (
          <section className="py-6">
            {results.length === 0 ? (
              <div className="text-neutral-600">No encontramos resultados. Prueba con otro término.</div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((p) => (
                  <li key={p.id} className="border border-neutral-200 rounded-2xl p-4 hover:shadow-sm transition">
                    <Link href={`/product/${p.slug}`} className="block">
                      <div className="aspect-[4/3] w-full bg-neutral-100 rounded-xl mb-3 overflow-hidden">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <h3 className="font-medium">{p.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.description}</p>
                      <div className="mt-2 text-sm text-neutral-500">
                        {p.category_name ?? 'Sin categoría'}
                      </div>
                      {p.price_eur != null || p.price != null ? (
                        <div className="mt-2 font-semibold">
                          {p.price_eur != null ? `${p.price_eur.toFixed(2)} €` : `${p.price!.toFixed(2)}`
                          }
                        </div>
                      ) : null}
                    </Link>
                  </li>
                ))}
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

  if (!q) {
    return { props: { q: null, results: [] } };
  }

  // Evitar wildcard locos
  const safe = q.slice(0, 128);

  const sql = `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    WHERE
      (name LIKE ? OR description LIKE ? OR slug LIKE ? OR category_name LIKE ? OR category_slug LIKE ?)
    ORDER BY id DESC
    LIMIT 30
  `;
  const like = `%${safe}%`;

  const results = await query<Product>(sql, [like, like, like, like, like]);

  return {
    props: {
      q: safe,
      results,
    },
  };
};
