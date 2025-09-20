import * as React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import CommonLayout from 'components/v2/Layout';
import { pool } from '../../lib/db';
import Breadcrumbs from 'components/v2/breadcrumbs';

type Item = {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  price_eur?: number | null;
  price?: number | null;
  category_name?: string | null;
  category_slug?: string | null;
};

type Props = { slug: string; name: string; items: Item[] };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  const [metaRows] = await pool.query(
    `SELECT COALESCE(category_name,'Uncategorized') AS name
     FROM products WHERE category_slug = ? LIMIT 1`, [slug]
  );
  const name = (metaRows as any[])[0]?.name || 'Uncategorized';

  const [rows] = await pool.query(
    `SELECT id, name, slug, image_url, price_eur, price, category_name, category_slug
     FROM products
     WHERE category_slug = ?
     ORDER BY id ASC
     LIMIT 120`, [slug]
  );

  return { props: { slug, name, items: rows as any[] } };
};

const fmt = (n?: number | null) => (typeof n === 'number' ? `€${n.toFixed(2)}` : '—');

const CategoryPage: NextPage<Props> = ({ slug, name, items }) => {
  return (
    <>
      <Head>
        <title>{name} — BlinkX</title>
        <meta name="description" content={`${name} products in the BlinkX catalog`} />
      </Head>
      <CommonLayout>
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: name }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">{name}</h1>
          <p className="text-gray-600 mb-6">Browse {items.length} products in this category.</p>

          {items.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((it) => (
                <NextLink
                  key={it.id}
                  href={`/product/${it.slug}`}
                  className="block border rounded-2xl p-4 hover:shadow-md transition bg-white"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 relative">
                    {it.image_url ? (
                      <Image
                        src={it.image_url}
                        alt={it.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold">{it.name}</h3>
                  <div className="text-sm text-gray-500">{it.category_name || '—'}</div>
                  <div className="mt-1 font-medium">{fmt(it.price_eur ?? it.price)}</div>
                </NextLink>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No products found.</div>
          )}
        </div>
      </CommonLayout>
    </>
  );
};

export default CategoryPage;

