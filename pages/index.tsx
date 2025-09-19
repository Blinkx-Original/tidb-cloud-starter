import * as React from 'react';
import Head from 'next/head';
import CommonLayout from 'components/v2/Layout';
import dynamic from 'next/dynamic';

const ProductList = dynamic(() => import('components/v2/Cards/ShoppingItemCardList'), { ssr: false });

export default function HomePage() {
  // paginación simple local
  const [page, setPage] = React.useState(1);
  const pageSize = 12;

  return (
    <>
      <Head>
        <title>BlinkX – Industrial Catalog</title>
        <meta name="description" content="BlinkX Catalog Homepage" />
      </Head>

      <CommonLayout>
        {/* H1/H2 editable arriba del grid */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold">BlinkX Catalog</h1>
          <p className="text-gray-600">Products, affiliates, and lead listings.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductList page={page} pageSize={pageSize} />

          {/* Controles de paginación muy simples */}
          <div className="flex items-center justify-center gap-3 pt-8">
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

