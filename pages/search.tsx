// pages/search.tsx
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2/Layout';
import { CatalogRepo } from '@/lib/repositories/catalog';
import { UI } from '@/lib/uiConfig';
import type { Product } from '@/lib/domain';
import SearchAnalytics from '@/components/v2/trackers/SearchAnalytics';
import { safeTrack } from '@/lib/analytics';

type Props = { q: string; products: Product[] };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const q = String(ctx.query.q ?? '').trim();
  const products = q ? await CatalogRepo.searchProducts(q) : [];
  return { props: { q, products } };
};

export default function SearchPage({ q, products }: Props) {
  const TitleTag = UI.headings.productTitleTag;

  return (
    <CommonLayout>
      <Head><title>Search — BlinkX</title></Head>
      <div className="max-w-5xl mx-auto p-4">
        <TitleTag className="text-2xl font-semibold mb-2">Search</TitleTag>
        <p className="mb-4 opacity-70">
          {q ? <>Results for “{q}” — {products.length} found</> : <>Type a query in the header.</>}
        </p>

        <SearchAnalytics query={q} resultsCount={products.length} source="page" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p, idx) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              onClick={() =>
                safeTrack('search_result_click', {
                  query: q,
                  productId: p.id,
                  slug: p.slug,
                  position: idx,
                })
              }
              className="card border rounded-2xl p-4 hover:shadow-sm"
            >
              <div className="font-medium">{p.name}</div>
              {p.price_eur != null && (
                <div className="text-sm opacity-70">€{p.price_eur}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </CommonLayout>
  );
}
