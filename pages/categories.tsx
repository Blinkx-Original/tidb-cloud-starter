// pages/categories.tsx
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2';
import { GetServerSideProps } from 'next';
import { query } from '@/lib/db';

type CategoryRow = { slug: string; name: string; count: number };

type Props = { categories: CategoryRow[] };

export default function CategoriesPage({ categories }: Props) {
  return (
    <CommonLayout>
      <Head>
        <title>Categorías — BlinkX</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4">
        <section className="py-8">
          <h1 className="text-2xl font-bold mb-4">Categorías</h1>

          {categories.length === 0 ? (
            <div className="text-neutral-600">No hay categorías aún.</div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((c) => (
                <li key={c.slug} className="border border-neutral-200 rounded-2xl p-4 hover:shadow-sm transition">
                  <Link href={`/category/${c.slug}`} className="block">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-neutral-500">{c.count}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const categories = await query<CategoryRow>(
    `
    SELECT
      COALESCE(category_slug, 'uncategorized') AS slug,
      COALESCE(category_name, 'Uncategorized') AS name,
      COUNT(*) AS count
    FROM products
    GROUP BY slug, name
    ORDER BY count DESC, name ASC
    LIMIT 100
  `
  );
  return { props: { categories } };
};
