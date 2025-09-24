// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2';
import SearchHero from '@/components/v2/SearchHero';
import { GetServerSideProps } from 'next';
import { query, Product } from '@/lib/db';
import { formatPriceEUR } from '@/lib/price';

type CategoryRow = { slug: string; name: string; count: number };
type Props = { categories: CategoryRow[]; products: Product[] };

export default function Home({ categories, products }: Props) {
  return (
    <CommonLayout>
      <Head>
        <title>BlinkX — Catálogo</title>
        <meta
          name="description"
          content="Encuentra tu próximo producto. Búsqueda simple y rápida en todo el catálogo."
        />
      </Head>

      {/* Hero de homepage: H1/H2 centrados */}
      <section className="border-b border-base-300 bg-base-200/50 dark:bg-base-200/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Encuentra tu próximo producto
          </h1>
          {/* H2 de muestra — cámbialo cuando quieras */}
          <h2 className="mt-2 text-lg sm:text-xl font-medium opacity-90">
            Búsqueda simple y rápida en todo el catálogo.
          </h2>
        </div>
      </section>

      {/* Pastilla (compacta, centrada y angosta; ahora con forma pill) */}
      <SearchHero variant="compact" />

      {/* Categorías populares */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl sm:text-2xl font-semibold">Categorías populares</h3>
          <Link href="/categories" className="text-sm underline hover:no-underline">
            Ver todas
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="mt-4 opacity-80">Aún no hay categorías.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-xl border border-base-300 hover:border-base-400 bg-base-100 px-4 py-3"
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs opacity-70">{c.count} productos</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Novedades */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h3 className="text-xl sm:text-2xl font-semibold">Novedades</h3>
        {products.length === 0 ? (
          <p className="mt-4 opacity-80">Aún no hay productos.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const price = formatPriceEUR(p.price_eur ?? p.price);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug || p.id}`}
                  className="group rounded-xl border border-base-300 hover:border-base-400 bg-base-100 overflow-hidden"
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-44 w-full object-cover bg-base-200"
                      loading="lazy"
                    />
                  ) : null}

                  <div className="p-4">
                    <div className="font-semibold group-hover:underline">{p.name}</div>
                    {p.description && (
                      <p className="mt-1 text-sm line-clamp-2 opacity-80">{p.description}</p>
                    )}
                    <div className="mt-2 text-xs opacity-70">
                      {p.category_name ?? 'Sin categoría'}
                    </div>
                    {price && <div className="mt-2 font-medium">{price}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const categories = await query<CategoryRow[]>(
    `
    SELECT
      COALESCE(category_slug, 'uncategorized') AS slug,
      COALESCE(category_name, 'Uncategorized') AS name,
      COUNT(*) AS count
    FROM products
    GROUP BY slug, name
    ORDER BY count DESC, name ASC
    LIMIT 12
  `
  );

  const products = await query<Product[]>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    ORDER BY id DESC
    LIMIT 12
  `
  );

  return { props: { categories, products } };
};
