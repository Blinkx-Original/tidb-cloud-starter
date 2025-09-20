// pages/blog/[slug].tsx
import * as React from 'react';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import CommonLayout from 'components/v2/Layout';
import StickyFooterCTA from 'components/v2/StickyFooterCTA';
import { getAllPostSlugs, getPostBySlug } from 'lib/posts';

type Props = {
  title: string;
  date?: string;
  html: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllPostSlugs();
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.slug || '');
  const { meta, html } = await getPostBySlug(slug);
  return {
    props: {
      title: meta.title,
      date: meta.date || null,
      html,
      ctaLabel: meta.cta_label || 'Go to offer',
      ctaUrl: meta.cta_url || '/contact',
    } as any,
  };
};

const PostPage: NextPage<Props> = ({ title, date, html, ctaLabel, ctaUrl }) => {
  const isExternal = ctaUrl ? /^https?:\/\//i.test(ctaUrl) : false;

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
            {date && <div className="text-sm text-gray-500 mt-1">{new Date(date).toLocaleDateString()}</div>}

            <article className="prose prose-neutral mt-6" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="mt-8">
              {isExternal ? (
                <a href={ctaUrl!} className="btn" target="_blank" rel="noopener noreferrer nofollow">
                  {ctaLabel}
                </a>
              ) : (
                <NextLink href={ctaUrl!} className="btn">
                  {ctaLabel}
                </NextLink>
              )}
            </div>
          </div>
        </div>

        {/* Spacer so content isn't hidden behind the sticky footer */}
        <div className="h-24 sm:h-20" aria-hidden />

        {/* Sticky footer CTA */}
        <StickyFooterCTA title={title} buttonLabel={ctaLabel || 'Go to offer'} href={ctaUrl || '/contact'} />
      </CommonLayout>
    </>
  );
};

export default PostPage;
