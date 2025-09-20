import * as React from 'react';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import CommonLayout from 'components/v2/Layout';
import { getAllPostsMeta } from 'lib/posts';

type PostCard = {
  slug: string;
  title: string;
  date: string | null;
  excerpt: string | null;
  cta_label: string | null;
  cta_url: string | null;
};

type Props = { posts: PostCard[] };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const meta = getAllPostsMeta();
  // Ensure no `undefined` in props
  const posts: PostCard[] = meta.map((m) => ({
    slug: m.slug,
    title: m.title,
    date: m.date ?? null,
    excerpt: m.excerpt ?? null,
    cta_label: m.cta_label ?? null,
    cta_url: m.cta_url ?? null,
  }));
  return { props: { posts } };
};

const BlogIndex: NextPage<Props> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>Blog — BlinkX</title>
        <meta name="description" content="BlinkX blog" />
      </Head>
      <CommonLayout>
        <div className="max-w-5xl mx-auto px-4 mt-12">
          <div className="bg-white shadow-sm border rounded-2xl p-6">
            <h1 className="text-2xl font-bold mb-2">Blog</h1>
            <p className="text-gray-600 mb-6">Articles, comparisons, and guides.</p>

            {posts.length === 0 ? (
              <div className="text-gray-500">No posts yet.</div>
            ) : (
              <ul className="divide-y">
                {posts.map((p) => (
                  <li key={p.slug} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <NextLink href={`/blog/${p.slug}`} className="font-semibold hover:underline line-clamp-1">
                          {p.title}
                        </NextLink>
                        <div className="text-sm text-gray-500">
                          {p.date ? new Date(p.date).toLocaleDateString() : '—'}
                        </div>
                        {p.excerpt && <p className="text-gray-600 mt-2 line-clamp-2">{p.excerpt}</p>}
                      </div>

                      {/* Optional CTA on list item if provided */}
                      {p.cta_url && p.cta_label && (
                        /^https?:\/\//i.test(p.cta_url) ? (
                          <a
                            href={p.cta_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="btn shrink-0"
                          >
                            {p.cta_label}
                          </a>
                        ) : (
                          <NextLink href={p.cta_url} className="btn shrink-0">
                            {p.cta_label}
                          </NextLink>
                        )
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CommonLayout>
    </>
  );
};

export default BlogIndex;
