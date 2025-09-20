// pages/blog/index.tsx
import * as React from 'react';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import CommonLayout from 'components/v2/Layout';
import { getAllPostsMeta, type PostMeta } from 'lib/posts';

type Props = { posts: PostMeta[] };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = getAllPostsMeta();
  return { props: { posts } };
};

const BlogIndex: NextPage<Props> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>Blog — BlinkX</title>
        <meta name="description" content="BlinkX blog posts." />
      </Head>

      <CommonLayout>
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center px-4 py-12">
          <h1 className="text-4xl font-bold text-black">Blog</h1>
          <p className="text-gray-600 mt-2">Updates, guides, and industrial insights.</p>
        </div>

        {/* Listado */}
        <div className="max-w-5xl mx-auto px-4 pb-10">
          {posts.length ? (
            <div className="grid grid-cols-1 gap-4">
              {posts.map((p) => (
                <NextLink
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <h2 className="text-xl font-semibold text-black">{p.title}</h2>
                  <div className="text-sm text-gray-500">
                    {p.date ? new Date(p.date).toLocaleDateString() : ''}
                  </div>
                  {p.excerpt && <p className="text-gray-600 mt-2">{p.excerpt}</p>}
                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full border text-xs text-gray-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </NextLink>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-8 shadow-sm text-center text-gray-500">
              No posts yet.
            </div>
          )}
        </div>
      </CommonLayout>
    </>
  );
};

export default BlogIndex;
