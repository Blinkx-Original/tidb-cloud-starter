// pages/categories.tsx
import Head from "next/head";
import Link from "next/link";
import CommonLayout from "@/components/v2";
import { GetServerSideProps } from "next";
import { query } from "@/lib/db";

type CategoryRow = { slug: string; name: string; count: number };

export default function CategoriesPage({ categories }: { categories: CategoryRow[] }) {
  return (
    <CommonLayout>
      <Head>
        <title>Categorías — BlinkX</title>
      </Head>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl sm:text-3xl font-semibold">Categories</h1>

        {categories.length === 0 ? (
          <p className="mt-4 opacity-80">Aún no hay categorías.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-xl border border-black/10 hover:border-black/20 bg-white px-4 py-3"
              >
                {/* 👇 Solo nombre; SIN contador */}
                <div className="font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const categories = await query<CategoryRow[]>(
    `
    SELECT
      COALESCE(category_slug, 'uncategorized') AS slug,
      COALESCE(category_name, 'Uncategorized') AS name,
      COUNT(*) AS count
    FROM products
    GROUP BY slug, name
    ORDER BY count DESC, name ASC
  `
  );
  return { props: { categories } };
};
