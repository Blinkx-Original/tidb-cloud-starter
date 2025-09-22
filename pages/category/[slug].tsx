// pages/category/[slug].tsx
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2';
import Breadcrumbs from '@/components/v2/breadcrumbs';
import { GetServerSideProps } from 'next';
import { query, Product } from '@/lib/db';
import { formatPriceEUR } from '@/lib/price';

type Props = {
  slug: string;
  name: string;
  count: number;
  products: Product[];
};

export default function CategoryPage({ slug, name, count, products }: Props) {
  return (
    <CommonLayout>
      <Head>
        <title>{name} — Categoría | BlinkX</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4 bg-black text-white min-h-screen">
        {/* Breadcrumbs */}
        <div className="pt-6">
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Categorías', href: '/categories' },
              { label: name },
            ]}
          />
        </div>

        {/* Header de categoría */}
        <header className="mt-6 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{name}</h1>
          <p className="mt-2 text-white">{count} producto{count === 1 ? '' : 's'}</p>
        </header>

        {/* Listado */}
        {products.length === 0 ? (
          <div className="py-10 text-white">No hay productos en esta categoría.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const price = formatPriceEUR(p.price_eur ?? p.price);
              return (
                <li key={p.id} className="border border-white rounded-2xl p-4 hover:shadow-sm transition">
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="aspect-[4/3] w-full bg-black rounded-xl mb-3 overflow-hidden">
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
                    <h3 className="font-medium text-white">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-white">{p.description}</p>
                    <div className="mt-2 text-sm text-white">{p.category_name ?? 'Sin categoría'}</div>
                    {price && <div className="mt-2 font-semibold text-white">{price}</div>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="h-10" />
      </main>
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
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

  const products = await query<Product>(
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
