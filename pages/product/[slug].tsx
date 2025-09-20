// pages/product/[slug].tsx
import * as React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import CommonLayout from 'components/v2/Layout';
import Breadcrumbs from 'components/v2/breadcrumbs';
import { pool } from '../../lib/db';
import StickyFooterCTA from 'components/v2/StickyFooterCTA';

type Product = {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  price_eur?: number | null;
  price?: number | null;
  description?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
};

type Props = { product: Product };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  const [rows] = await pool.query(
    `SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
     FROM products WHERE slug = ? LIMIT 1`,
    [slug]
  );
  const product = (rows as any[])[0] || null;
  if (!product) return { notFound: true };
  return { props: { product } };
};

const fmt = (n?: number | null) => (typeof n === 'number' ? `€${n.toFixed(2)}` : '—');

const ProductPage: NextPage<Props> = ({ product }) => {
  const primaryCtaLabel = 'Request a quote';   // change per project
  const primaryCtaHref = '/contact';           // could be an Amazon URL, etc.
  const isExternal = /^https?:\/\//i.test(primaryCtaHref);

  return (
    <>
      <Head>
        <title>{product.name} — BlinkX</title>
        <meta name="description" content={product.description || product.name} />
      </Head>

      <CommonLayout>
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              product.category_name
                ? { label: product.category_name, href: `/category/${product.category_slug}` }
                : { label: 'Catalog', href: '/categories' },
              { label: product.name },
            ]}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="bg-white border rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <div className="text-gray-600 mt-1">{product.category_name || '—'}</div>
              <div className="text-xl font-semibold mt-2">{fmt(product.price_eur ?? product.price)}</div>

              <div className="mt-5 prose prose-neutral">
                {product.description ? <p>{product.description}</p> : <p>No description available.</p>}
              </div>

              <div className="mt-6">
                {isExternal ? (
                  <a href={primaryCtaHref} className="btn" target="_blank" rel="noopener noreferrer nofollow">
                    {primaryCtaLabel}
                  </a>
                ) : (
                  <NextLink href={primaryCtaHref} className="btn">
                    {primaryCtaLabel}
                  </NextLink>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Spacer so content isn't hidden behind the sticky footer */}
        <div className="h-24 sm:h-20" aria-hidden />

        {/* Sticky footer CTA */}
        <StickyFooterCTA
          title={product.name}
          buttonLabel={primaryCtaLabel}
          href={primaryCtaHref}
        />
      </CommonLayout>
    </>
  );
};

export default ProductPage;
