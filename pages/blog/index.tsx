import * as React from 'react';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import CommonLayout from 'components/v2/Layout';
import { getAllPostsMeta, type BlogMeta } from 'lib/blog';

type Props = { posts: BlogMeta[] };

export const getStaticProps: GetStaticProps<Props> = async () => {
  return { props: { posts: getAllPostsMeta() } };
};

const BlogIndex: NextPage<Props> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>Blog — BlinkX</title>
        <meta name="description" content="BlinkX blog posts." />
      </Head>
      <CommonLayout>
        <div className="max-w-3xl mx-auto text-center px-4 py-12">
          <h1 className="text-4xl font-bold text-black">Blog</h1>
          <p className="text-gray-600 mt-2">Updates, notes, and ideas.</p>
        </div>

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
