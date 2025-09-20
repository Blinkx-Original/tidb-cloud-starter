import * as React from 'react';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import CommonLayout from 'components/v2/Layout';
import { getAllPostSlugs, getPostBySlug } from 'lib/blog';

type Props = { title: string; date?: string; html: string };

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllPostSlugs();
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.slug || '');
  const { meta, html } = await getPostBySlug(slug);
  return { props: { title: meta.title, date: meta.date, html } };
};

const PostPage: NextPage<Props> = ({ title, date, html }) => {
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
            {date && (
              <div className="text-sm text-gray-500 mt-1">
                {new Date(date).toLocaleDateString()}
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
