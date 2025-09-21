// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2';
import SearchPill from '@/components/v2/SearchPill';
import { GetServerSideProps } from 'next';
import { query, Product } from '@/lib/db';
import { formatPriceEUR } from '@/lib/price';

type CategoryRow = { slug: string; name: string; count: number };

type Props = {
  categories: CategoryRow[];
  products: Product[];
};

export default function Home({ categories, products }: Props) {
  return (
    <CommonLayout>
      <Head>
        <title>BlinkX — Catálogo</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4">
        {/* HERO */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold">Encuentra tu próximo producto</h1>
            <p className="mt-3 text-neutral-600">Búsqueda simple y rápida en todo el catálogo.</p>
          </div>

          <div className="mt-6 flex justify-center">
            <SearchPill size="lg" placeholder="Buscar por nombre, categoría o descripción..." autoFocus />
          </div>

          <div className="mt-4 text-center text-sm text-neutral-500">
            Sugerencias: <Link href="/categories" className="underline">ver categorías</Link>
          </div>
        </section>

        {/* CATEGORÍAS POPULARES */}
        <section className="py-6 border-t border-neutral-200">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold">Categorías populares</h2>
            <Link href="/categories" className="text-sm underline">Ver todas</Link>
          </div>
          {categories.length === 0 ? (
            <div className="text-neutral-600">Aún no hay categorías.</div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((c) => (
                <li key={c.slug} className="border border-neutral-200 rounded-2xl p-4 hover:shadow-sm transition">
                  <Link href={`/category/${c.slug}`} className="block">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-neutral-500">{c.count}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* NOVEDADES */}
        <section className="py-6 border-t border-neutral-200">
          <h2 className="mb-4 text-xl font-semibold">Novedades</h2>
          {products.length === 0 ? (
            <div className="text-neutral-600">Aún no hay productos.</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => {
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

        <div className="h-10" />
      </main>
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const categories = await query<CategoryRow>(`
    SELECT
      COALESCE(category_slug, 'uncategorized') AS slug,
      COALESCE(category_name, 'Uncategorized') AS name,
      COUNT(*) AS count
    FROM products
    GROUP BY slug, name
    ORDER BY count DESC, name ASC
    LIMIT 12
  `);

  const products = await query<Product>(`
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    ORDER BY id DESC
    LIMIT 12
  `);

  return { props: { categories, products } };
};

