// pages/blog/[slug].tsx
import * as React from 'react';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import CommonLayout from 'components/v2/Layout';
import { getAllPostSlugs, getPostBySlug } from 'lib/posts';

type Props = {
  title: string;
  date?: string;
  html: string;
  tags?: string[];
  category?: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllPostSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.slug || '');
  const { meta, html } = await getPostBySlug(slug);
  return {
    props: {
      title: meta.title,
      date: meta.date,
      html,
      tags: meta.tags || null,
      category: meta.category || null,
    } as any,
  };
};

const PostPage: NextPage<Props> = ({ title, date, html, tags, category }) => {
  return (
    <>
      <Head>
        <title>{title} — BlinkX</title>
        <meta name="description" content={title} />
      </Head>

      <CommonLayout>
        <div className="max-w-3xl mx-auto px-4 mt-12">
          <div className="bg-white shadow-sm border rounded-2xl p-8">
            <h1 className="text-3xl font-bold">{title}</h1>

            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              {date && <span>{new Date(date).toLocaleDateString()}</span>}
              {category && (
                <>
                  <span>•</span>
                  <span>{category}</span>
                </>
              )}
            </div>

            {tags && tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full border text-xs text-gray-600">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <article
              className="prose prose-neutral mt-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </CommonLayout>
    </>
  );
};

export default PostPage;
