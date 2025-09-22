// pages/product/[slug].tsx
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import CommonLayout from '@/components/v2/Layout';
import Breadcrumbs from '@/components/v2/breadcrumbs';
import StickyFooterCTA from '@/components/v2/StickyFooterCTA';
import { CatalogRepo } from '@/lib/repositories/catalog';
import { UI } from '@/lib/uiConfig';
import type { Product } from '@/lib/domain';

type Props = { product: Product | null };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  const product = await CatalogRepo.getProductBySlug(slug);
  return { props: { product } };
};

export default function ProductDetail({ product }: Props) {
  const TitleTag = UI.headings.productTitleTag;

  if (!product) {
    return (
      <CommonLayout>
        <div className="max-w-3xl mx-auto p-6">
          <p>Product not found.</p>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <Head><title>{product.name} — BlinkX</title></Head>
      <div className="max-w-3xl mx-auto p-4">
        <Breadcrumbs
          items={[
            { label: 'Categories', href: '/categories' },
            product.category_slug
              ? { label: product.category_name ?? 'Category', href: `/category/${product.category_slug}` }
              : undefined,
            { label: product.name },
          ].filter(Boolean) as any}
        />

        <div className="card border rounded-2xl p-4">
          <TitleTag className="text-2xl font-semibold mb-3">{product.name}</TitleTag>
          {product.image_url && (
            <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden rounded-xl border">
              <Image src={product.image_url} alt={product.name} fill className="object-contain" />
            </div>
          )}
          {product.price_eur != null && (
            <div className="text-lg font-medium mb-2">€{product.price_eur}</div>
          )}
          {product.description && <p className="opacity-80">{product.description}</p>}
        </div>

        {/* spacer to avoid overlap with sticky bar */}
        {UI.stickyFooter.enabledOnProduct && <div className="h-24 sm:h-20" />}
      </div>

      {UI.stickyFooter.enabledOnProduct && (
        <StickyFooterCTA
          title={product.name}
          buttonLabel="Buy now"
          buttonHref={`/product/${product.slug}`}
          backgroundClass={UI.stickyFooter.background}
        />
      )}
    </CommonLayout>
  );
}
