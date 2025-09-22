// pages/product/[slug].tsx
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import CommonLayout from '@/components/v2';
import Breadcrumbs from '@/components/v2/breadcrumbs';
import { query, Product } from '@/lib/db';
import { formatPriceEUR } from '@/lib/price';
const StickyFooterCTA: any = require('@/components/v2/StickyFooterCTA').default;

type Props = { product: Product };

export default function ProductPage({ product }: Props) {
  const price = formatPriceEUR(product.price_eur ?? product.price);
  const categoryUrl = product.category_slug ? `/category/${product.category_slug}` : '/categories';

  return (
    <CommonLayout>
      <Head>
        <title>{product.name} — BlinkX</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4">
        <div className="py-4">
          <Breadcrumbs
            items={[
              { href: '/', label: 'Inicio' },
              { href: '/categories', label: 'Categorías' },
              product.category_slug
                ? { href: `/category/${product.category_slug}`, label: product.category_name ?? 'Categoría' }
                : { href: '/categories', label: 'Categorías' },
              { href: `/product/${product.slug}`, label: product.name },
            ]}
          />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-neutral-100 aspect-[4/3]">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : null}
          </div>

          <div className="border border-neutral-200 rounded-2xl p-5">
            <h1 className="text-2xl font-bold">{product.name}</h1>

            {product.category_slug && (
              <div className="mt-2 text-sm">
                <Link href={categoryUrl} className="underline">
                  {product.category_name ?? 'Ver categoría'}
                </Link>
              </div>
            )}

            {price && <div className="mt-4 text-xl font-semibold">{price}</div>}

            {product.description && (
              <p className="mt-4 text-neutral-700 whitespace-pre-line">{product.description}</p>
            )}

            <div className="mt-6">
              <Link
                href={categoryUrl}
                className="inline-flex items-center justify-center rounded-xl border border-black bg-black text-white px-4 py-2 hover:opacity-90"
              >
                Ver más en {product.category_name ?? 'categoría'}
              </Link>
            </div>
          </div>
        </section>

        <div className="h-24 sm:h-20" />
      </main>

      <StickyFooterCTA
        title={product.name}
        buttonLabel={product.category_name ? `Más en ${product.category_name}` : 'Ver categorías'}
        buttonHref={categoryUrl}
      />
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const raw = String(ctx.params?.slug ?? '');
  const slug = decodeURIComponent(raw);

  const rows = await query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    WHERE LOWER(TRIM(slug)) = LOWER(TRIM(?))
    LIMIT 1
    `,
    [slug]
  );

  if (rows.length === 0) {
    return { notFound: true };
  }

  return { props: { product: rows[0] } };
};
