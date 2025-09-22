// pages/categories.tsx
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2/Layout';
import { CatalogRepo } from '@/lib/repositories/catalog';
import { UI } from '@/lib/uiConfig';
import type { Category } from '@/lib/domain';

type Props = { categories: Category[] };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const categories = await CatalogRepo.getAllCategories();
  return { props: { categories } };
};

export default function CategoriesPage({ categories }: Props) {
  const TitleTag = UI.headings.categoryTitleTag;

  return (
    <CommonLayout>
      <Head><title>Categories — BlinkX</title></Head>
      <div className="max-w-5xl mx-auto p-4">
        <TitleTag className="text-2xl font-semibold mb-4">Categories</TitleTag>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="card border rounded-2xl p-4 hover:shadow-sm"
            >
              <span className="font-medium">{c.name}</span>
              {typeof c.count === 'number' && (
                <span className="text-sm opacity-60">{c.count} products</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </CommonLayout>
  );
}
