import * as React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import CommonLayout from 'components/v2/Layout';
import { pool } from '../lib/db';

type Category = {
  slug: string;
  name: string;
  count: number;
};

type Props = { categories: Category[] };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [rows] = await pool.query(
    `SELECT
       COALESCE(category_slug, 'uncategorized') AS slug,
       COALESCE(category_name, 'Uncategorized') AS name,
       COUNT(*) AS count
     FROM products
     GROUP BY category_slug, category_name
     ORDER BY count DESC, name ASC`
  );

  return {
    props: {
      categories: (rows as any[]).map(r => ({
        slug: r.slug,
        name: r.name,
        count: Number(r.count || 0),
      })),
    },
  };
};

const CategoriesPage: NextPage<Props> = ({ categories }) => {
  return (
    <>
      <Head>
        <title>Categories — BlinkX</title>
        <meta name="description" content="Browse all categories in the BlinkX catalog." />
      </Head>

      <CommonLayout>
        {/* Hero / Header */}
        <div className="max-w-3xl mx-auto text-center px-4 py-12">
          <h1 className="text-4xl font-bold text-black font-sans mb-3">Categories</h1>
          <h2 className="text-xl text-gray-600 font-sans">
            Explore the catalog by category
          </h2>
        </div>

        {/* Categories grid */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          {categories.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <NextLink
                  key={cat.slug}
                  href={`/category/${encodeURIComponent(cat.slug)}`}
                  className="block bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="text-lg font-semibold text-black">{cat.name}</div>
                  <div className="text-sm text-gray-500">{cat.count} products</div>
                </NextLink>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-8 shadow-sm text-center text-gray-500">
              No categories found.
            </div>
          )}
        </div>
      </CommonLayout>
    </>
  );
};

export default CategoriesPage;
