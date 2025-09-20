import * as React from 'react';
import Head from 'next/head';
import CommonLayout from 'components/v2/Layout';
import dynamic from 'next/dynamic';
import CategoryGrid from 'components/v2/CategoryGrid';

const ProductList = dynamic(() => import('components/v2/Cards/ShoppingItemCardList'), { ssr: false });

export default function HomePage() {
  const [page, setPage] = React.useState(1);
  const pageSize = 6; // fewer featured products on homepage

  return (
    <>
      <Head>
        <title>BlinkX – Industrial Catalog</title>
        <meta name="description" content="BlinkX Catalog Homepage" />
      </Head>

      <CommonLayout>
        {/* HERO TEXT (centered) */}
        <div className="max-w-3xl mx-auto text-center px-4 py-12">
          <h1 className="text-4xl font-bold text-black font-sans mb-4">
            BlinkX Catalog
          </h1>
          <h2 className="text-xl text-gray-600 font-sans mb-6">
            Products, affiliates, and lead listings
          </h2>
          <p className="text-gray-500 font-sans leading-relaxed">
            Every deploy is remarkable. Chat with your team on real, production-grade UI,
            not just designs.
          </p>
        </div>

        {/* CATEGORIES GRID */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <div className="bg-white shadow-sm border rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Categories</h3>
              <p className="text-sm text-gray-500">Explore the catalog by category.</p>
            </div>
            <CategoryGrid />
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Featured products</h3>
            <a href="/category/uncategorized" className="text-sm text-gray-500 hover:underline">Browse all</a>
          </div>
          <ProductList page={page} pageSize={pageSize} />

          <div className="flex items-center justify-center gap-3 pt-10">
            <button
              className="btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button className="btn" onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        </div>
      </CommonLayout>
    </>
  );
}

