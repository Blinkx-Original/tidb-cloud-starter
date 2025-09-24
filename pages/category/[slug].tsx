// pages/category/[slug].tsx
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2';
import Breadcrumbs from '@/components/v2/breadcrumbs';
import SearchHero from '@/components/v2/SearchHero';
import { GetServerSideProps } from 'next';
import { query, Product } from '@/lib/db';
import { formatPriceEUR } from '@/lib/price';

type Props = { slug: string; name: string; count: number; products: Product[] };

export default function CategoryPage({ slug, name, count, products }: Props) {
  return (
    <CommonLayout>
      <Head>
        <title>{name} — Categoría | BlinkX</title>
        <meta name="robots" content="index,follow" />
      </Head>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-6xl px-4 pt-3 sm:pt-4">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Categorías', href: '/categories' },
            { label: name, href: `/category/${slug}` },
          ]}
        />
      </div>

      {/* Search hero compacto (sin textos largos, centrado y angosto) */}
      <SearchHero variant="compact" />

      {/* Título y conteo */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{name}</h1>
          <div className="text-sm opacity-70">
            {count} producto{count === 1 ? '' : 's'}
          </div>
        </div>

        {/* Grid de productos */}
        {products.length === 0 ? (
          <p className="mt-6 opacity-80">No hay productos en esta categoría.</p>
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = String(params?.slug ?? '');

  const info = await query<{ name: string; count: number }>(
    `
    SELECT
      COALESCE(MAX(category_name), 'Uncategorized') AS name,
      COUNT(*) AS count
    FROM products
    WHERE COALESCE(category_slug, 'uncategorized') = ?
  `,
    [slug]
  );

  const name = info[0]?.name ?? 'Uncategorized';
  const count = Number(info[0]?.count ?? 0);

  const products = await query<Product[]>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    WHERE COALESCE(category_slug, 'uncategorized') = ?
    ORDER BY id DESC
  `,
    [slug]
  );

  return { props: { slug, name, count, products } };
};
