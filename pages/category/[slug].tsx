// pages/category/[slug].tsx
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2/Layout';
import Breadcrumbs from '@/components/v2/breadcrumbs';
import { CatalogRepo } from '@/lib/repositories/catalog';
import { UI } from '@/lib/uiConfig';
import type { Product } from '@/lib/domain';

type Props = { slug: string; products: Product[] };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  const products = await CatalogRepo.getProductsByCategorySlug(slug);
  return { props: { slug, products } };
};

export default function CategoryDetail({ slug, products }: Props) {
  const TitleTag = UI.headings.categoryTitleTag;

  return (
    <CommonLayout>
      <Head><title>{slug} — Category — BlinkX</title></Head>
      <div className="max-w-5xl mx-auto p-4">
        <Breadcrumbs items={[{ label: 'Categories', href: '/categories' }, { label: slug }]} />
        <TitleTag className="text-2xl font-semibold mb-4 capitalize">{slug}</TitleTag>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
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
