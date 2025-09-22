// pages/category/[slug].tsx
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import CommonLayout from '@/components/v2';
import Breadcrumbs from '@/components/v2/breadcrumbs';
import { query, Product } from '@/lib/db';
import { formatPriceEUR } from '@/lib/price';

type Props = {
  slug: string;
  name: string;
  products: Product[];
};

export default function CategoryPage({ slug, name, products }: Props) {
  return (
    <CommonLayout>
      <Head>
        <title>{name} — Categoría | BlinkX</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4">
        <div className="py-4">
          <Breadcrumbs
            items={[
              { href: '/', label: 'Inicio' },
              { href: '/categories', label: 'Categorías' },
              { href: `/category/${slug}`, label: name },
            ]}
          />
        </div>

        <section className="py-6">
          <h1 className="text-2xl font-bold mb-4">{name}</h1>

          {products.length === 0 ? (
            <div className="text-neutral-600">No hay productos en esta categoría.</div>
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
      </main>
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const raw = String(ctx.params?.slug ?? '');
  const slug = decodeURIComponent(raw);

  // 1) Traemos productos igualando en minúsculas y sin espacios
  const products = await query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    WHERE LOWER(TRIM(COALESCE(category_slug, 'uncategorized'))) = LOWER(TRIM(?))
    ORDER BY id DESC
    LIMIT 120
    `,
    [slug]
  );

  // 2) Intentamos sacar el nombre "bonito" de la categoría
  let name = 'Categoría';
  if (products.length > 0) {
    name = products[0].category_name ?? 'Categoría';
  } else {
    // fallback legible si no hay nombre en DB
    const pretty = slug.trim().replace(/[-_]+/g, ' ');
    name = pretty ? pretty.charAt(0).toUpperCase() + pretty.slice(1) : 'Categoría';
  }

  return { props: { slug, name, products } };
};

